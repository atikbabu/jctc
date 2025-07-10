import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import Sale from '@/models/Sale';
import FinishedProduct from '@/models/FinishedProduct';
import Material from '@/models/Material';
import PurchaseOrder from '@/models/PurchaseOrder';
import Employee from '@/models/Employee';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Sales Data
      const totalSales = await Sale.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]);
      const salesCount = await Sale.countDocuments();

      // Production Data
      const finishedProductsCount = await FinishedProduct.countDocuments();

      // Inventory Data (Materials with low stock)
      const lowStockMaterials = await Material.countDocuments({ $expr: { $lte: ['$quantityInStock', '$reorderLevel'] } });

      // Purchase Order Data
      const pendingPurchaseOrders = await PurchaseOrder.countDocuments({ status: 'Pending' });
      const totalPurchaseAmount = await PurchaseOrder.aggregate([
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]);

      // HR Data
      const totalEmployees = await Employee.countDocuments();

      res.status(200).json({
        totalSales: totalSales[0]?.total || 0,
        salesCount,
        finishedProductsCount,
        lowStockMaterials,
        pendingPurchaseOrders,
        totalPurchaseAmount: totalPurchaseAmount[0]?.total || 0,
        totalEmployees,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

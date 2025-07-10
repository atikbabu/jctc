import dbConnect from '@/lib/dbConnect';
import PurchaseOrder from '@/models/PurchaseOrder';
import Material from '@/models/Material';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'material_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const purchaseOrder = await PurchaseOrder.findById(id)
        .populate('vendor')
        .populate('createdBy', 'name')
        .populate('items.material');
      if (!purchaseOrder) {
        return res.status(404).json({ error: 'Purchase Order not found' });
      }
      return res.status(200).json(purchaseOrder);
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      return res.status(500).json({ error: 'Failed to fetch purchase order' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { items, ...rest } = req.body;
      let totalAmount = 0;

      const processedItems = items.map(item => {
        const itemTotalPrice = item.quantity * item.unitPrice;
        totalAmount += itemTotalPrice;
        return { ...item, totalPrice: itemTotalPrice };
      });

      const oldPurchaseOrder = await PurchaseOrder.findById(id);
      if (!oldPurchaseOrder) {
        return res.status(404).json({ error: 'Purchase Order not found' });
      }

      if (rest.status === 'Received' && oldPurchaseOrder.status !== 'Received') {
        for (const item of processedItems) {
          if (item.itemType === 'Material' && item.material) {
            await Material.findByIdAndUpdate(
              item.material,
              { $inc: { quantityInStock: item.quantity } },
              { new: true }
            );
          }
        }
      }

      const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
        id,
        { ...rest, items: processedItems, totalAmount },
        { new: true }
      );
      return res.status(200).json(purchaseOrder);
    } catch (error) {
      console.error('Error updating purchase order:', error);
      return res.status(400).json({ error: 'Purchase order update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await PurchaseOrder.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      return res.status(500).json({ error: 'Purchase order deletion failed' });
    }
  }

  res.status(405).end();
}

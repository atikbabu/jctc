import dbConnect from '@/lib/dbConnect';
import Material from '@/models/Material';
import PurchaseOrder from '@/models/PurchaseOrder';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'material_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { startDate, endDate, materialId } = req.query;
      let query = {};

      if (startDate && endDate) {
        query.orderDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      if (materialId) {
        query['items.material'] = materialId;
      }

      const materialCosts = await PurchaseOrder.aggregate([
        { $match: query },
        { $unwind: '$items' },
        { $match: materialId ? { 'items.material': new mongoose.Types.ObjectId(materialId) } : {} },
        { $lookup: {
            from: 'materials',
            localField: 'items.material',
            foreignField: '_id',
            as: 'materialInfo'
        }},
        { $unwind: '$materialInfo' },
        { $group: {
            _id: '$items.material',
            materialName: { $first: '$materialInfo.name' },
            totalCost: { $sum: '$items.totalPrice' },
            totalQuantity: { $sum: '$items.quantity' },
        }},
        { $project: {
            _id: 0,
            materialId: '$_id',
            materialName: 1,
            totalCost: 1,
            totalQuantity: 1,
            averageCostPerUnit: { $divide: ['$totalCost', '$totalQuantity'] }
        }}
      ]);

      res.status(200).json({ materialCosts });
    } catch (error) {
      console.error('Error fetching material cost report:', error);
      res.status(500).json({ error: 'Failed to fetch material cost report' });
    }
  } else {
    res.status(405).end();
  }
}

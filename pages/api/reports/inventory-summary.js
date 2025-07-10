
import dbConnect from '../../../lib/dbConnect';
import Material from '../../../models/Material';
import ProcessedGood from '../../../models/ProcessedGood';
import FinishedGood from '../../../models/FinishedGood';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'material_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  const { method } = req;

  await dbConnect();

  if (method === 'GET') {
    try {
      const totalRawMaterials = await Material.aggregate([
        { $group: { _id: null, total: { $sum: '$quantityInStock' } } }
      ]);

      const totalProcessedGoods = await ProcessedGood.aggregate([
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);

      const totalFinishedGoods = await FinishedGood.aggregate([
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalRawMaterials: totalRawMaterials.length > 0 ? totalRawMaterials[0].total : 0,
          totalProcessedGoods: totalProcessedGoods.length > 0 ? totalProcessedGoods[0].total : 0,
          totalFinishedGoods: totalFinishedGoods.length > 0 ? totalFinishedGoods[0].total : 0,
        },
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}

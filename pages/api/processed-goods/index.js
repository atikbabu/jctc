
import dbConnect from '../../../lib/dbConnect';
import ProcessedGood from '../../../models/ProcessedGood';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const processedGoods = await ProcessedGood.find({})
          .populate('workOrder')
          .populate('product')
          .populate('currentStage');
        res.status(200).json({ success: true, data: processedGoods });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}


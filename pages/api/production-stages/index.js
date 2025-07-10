
import dbConnect from '../../../lib/dbConnect';
import ProductionStage from '../../../models/ProductionStage';
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
        const stages = await ProductionStage.find({});
        res.status(200).json({ success: true, data: stages });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case 'POST':
      try {
        const stage = await ProductionStage.create(req.body);
        res.status(201).json({ success: true, data: stage });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}

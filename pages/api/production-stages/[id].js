
import dbConnect from '../../../lib/dbConnect';
import ProductionStage from '../../../models/ProductionStage';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const stage = await ProductionStage.findById(id);
        if (!stage) {
          return res.status(404).json({ success: false, error: 'Production stage not found' });
        }
        res.status(200).json({ success: true, data: stage });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'PUT':
      try {
        const { name, description } = req.body;
        const updatedStage = await ProductionStage.findByIdAndUpdate(
          id,
          { name, description },
          { new: true, runValidators: true }
        );
        if (!updatedStage) {
          return res.status(404).json({ success: false, error: 'Production stage not found' });
        }
        res.status(200).json({ success: true, data: updatedStage });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const deletedStage = await ProductionStage.deleteOne({ _id: id });
        if (!deletedStage) {
          return res.status(404).json({ success: false, error: 'Production stage not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, error: 'Method Not Allowed' });
      break;
  }
}

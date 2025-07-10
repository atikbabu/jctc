
import dbConnect from '../../../lib/dbConnect';
import WorkOrder from '../../../models/WorkOrder';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  const { method } = req;
  const { id } = req.query;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const workOrder = await WorkOrder.findById(id)
          .populate('product')
          .populate('stages')
          .populate({ path: 'rawMaterialsUsed.material', model: 'Material' });
          
        if (!workOrder) {
          return res.status(404).json({ success: false });
        }
        res.status(200).json({ success: true, data: workOrder });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    // We can add PUT and DELETE methods here later to update/delete a work order
    default:
      res.status(400).json({ success: false });
      break;
  }
}


import dbConnect from '../../../lib/dbConnect';
import WorkOrder from '../../../models/WorkOrder';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  const { method } = req;

  await dbConnect();

  if (method === 'GET') {
    try {
      const totalWorkOrders = await WorkOrder.countDocuments();
      const pendingWorkOrders = await WorkOrder.countDocuments({ status: 'Pending' });
      const inProgressWorkOrders = await WorkOrder.countDocuments({ status: 'In Progress' });
      const completedWorkOrders = await WorkOrder.countDocuments({ status: 'Completed' });
      const cancelledWorkOrders = await WorkOrder.countDocuments({ status: 'Cancelled' });

      const totalQuantityProduced = await WorkOrder.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]);

      res.status(200).json({
        success: true,
        data: {
          totalWorkOrders,
          pendingWorkOrders,
          inProgressWorkOrders,
          completedWorkOrders,
          cancelledWorkOrders,
          totalQuantityProduced: totalQuantityProduced.length > 0 ? totalQuantityProduced[0].total : 0,
        },
      });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}

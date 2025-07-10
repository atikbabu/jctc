import dbConnect from '@/lib/dbConnect';
import DailyProductionLog from '@/models/DailyProductionLog';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const log = await DailyProductionLog.findById(id)
        .populate('employee')
        .populate('finishedProduct');
      if (!log) {
        return res.status(404).json({ error: 'Daily production log not found' });
      }
      return res.status(200).json(log);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch daily production log' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const log = await DailyProductionLog.findByIdAndUpdate(id, req.body, { new: true });
      if (!log) {
        return res.status(404).json({ error: 'Daily production log not found' });
      }
      return res.status(200).json(log);
    } catch (error) {
      return res.status(400).json({ error: 'Daily production log update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await DailyProductionLog.findByIdAndDelete(id);
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Daily production log deletion failed' });
    }
  }

  res.status(405).end();
}

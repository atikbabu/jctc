import dbConnect from '@/lib/dbConnect';
import DailyProductionLog from '@/models/DailyProductionLog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const logs = await DailyProductionLog.find({})
        .populate('employee')
        .populate('processingProduct')
        .populate('productionStage');
      return res.status(200).json(logs);
    } catch (error) {
      console.error('Error fetching daily production logs:', error);
      return res.status(500).json({ error: 'Failed to fetch daily production logs', details: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const log = await DailyProductionLog.create(req.body);
      return res.status(201).json(log);
    } catch (error) {
      console.error('Error creating daily production log:', error);
      return res.status(400).json({ error: 'Daily production log creation failed', details: error.message });
    }
  }

  res.status(405).end();
}

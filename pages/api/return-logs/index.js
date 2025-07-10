import dbConnect from '@/lib/dbConnect';
import ReturnLog from '@/models/ReturnLog';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'cashier'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const returnLogs = await ReturnLog.find().populate('finishedProduct');
      return res.status(200).json(returnLogs);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch return logs' });
    }
  }

  if (req.method === 'POST') {
    try {
      const returnLog = await ReturnLog.create(req.body);
      return res.status(201).json(returnLog);
    } catch (error) {
      return res.status(400).json({ error: 'Return log creation failed' });
    }
  }

  res.status(405).end();
}

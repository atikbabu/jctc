import dbConnect from '@/lib/dbConnect';
import ReturnLog from '@/models/ReturnLog';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'cashier'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const returnLog = await ReturnLog.findById(id).populate('finishedProduct');
      if (!returnLog) {
        return res.status(404).json({ error: 'Return log not found' });
      }
      return res.status(200).json(returnLog);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch return log' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const returnLog = await ReturnLog.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!returnLog) {
        return res.status(404).json({ error: 'Return log not found' });
      }
      return res.status(200).json(returnLog);
    } catch (error) {
      return res.status(400).json({ error: 'Return log update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const returnLog = await ReturnLog.findByIdAndDelete(id);
      if (!returnLog) {
        return res.status(404).json({ error: 'Return log not found' });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete return log' });
    }
  }

  res.status(405).end();
}

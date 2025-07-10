import dbConnect from '@/lib/dbConnect';
import FinishedProduct from '@/models/FinishedProduct';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const finishedProduct = await FinishedProduct.findById(id).populate('processingProduct');
      if (!finishedProduct) {
        return res.status(404).json({ error: 'Finished product not found' });
      }
      return res.status(200).json(finishedProduct);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch finished product' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const finishedProduct = await FinishedProduct.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!finishedProduct) {
        return res.status(404).json({ error: 'Finished product not found' });
      }
      return res.status(200).json(finishedProduct);
    } catch (error) {
      return res.status(400).json({ error: 'Finished product update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const finishedProduct = await FinishedProduct.findByIdAndDelete(id);
      if (!finishedProduct) {
        return res.status(404).json({ error: 'Finished product not found' });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete finished product' });
    }
  }

  res.status(405).end();
}

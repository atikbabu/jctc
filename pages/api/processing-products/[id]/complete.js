import dbConnect from '@/lib/dbConnect';
import ProcessingProduct from '@/models/ProcessingProduct';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const processingProduct = await ProcessingProduct.findByIdAndUpdate(
        id,
        { status: 'Completed', endDate: new Date() },
        { new: true, runValidators: true }
      );

      if (!processingProduct) {
        return res.status(404).json({ error: 'Processing product not found' });
      }

      return res.status(200).json(processingProduct);
    } catch (error) {
      console.error('Error updating processing product status:', error);
      return res.status(500).json({ error: 'Failed to update processing product status', details: error.message });
    }
  }

  res.status(405).end();
}

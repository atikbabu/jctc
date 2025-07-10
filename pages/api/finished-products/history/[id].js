import dbConnect from '@/lib/dbConnect';
import FinishedProduct from '@/models/FinishedProduct';
import ProcessingProduct from '@/models/ProcessingProduct';
import Material from '@/models/Material';
import Employee from '@/models/Employee';
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
      const finishedProduct = await FinishedProduct.findById(id)
        .populate({
          path: 'processingProduct',
          model: 'ProcessingProduct',
          populate: [
            { path: 'purchasedProduct', model: 'Material' },
            { path: 'cuttingStaff', model: 'Employee' },
            { path: 'embroideryStaff', model: 'Employee' },
            { path: 'packagingStaff', model: 'Employee' },
          ],
        })
        .populate('category')
        .populate('subCategory');

      if (!finishedProduct) {
        return res.status(404).json({ error: 'Finished Product not found' });
      }

      res.status(200).json(finishedProduct);
    } catch (error) {
      console.error('Error fetching finished product history:', error);
      res.status(500).json({ error: 'Failed to fetch finished product history' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

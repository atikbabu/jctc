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

  if (req.method === 'GET') {
    try {
      const processingProduct = await ProcessingProduct.findById(id)
        .populate('purchasedProduct')
        .populate('cuttingStaff')
        .populate('embroideryStaff')
        .populate('packagingStaff')
        .populate('category')
        .populate('subCategory');
      if (!processingProduct) {
        return res.status(404).json({ error: 'Processing product not found' });
      }
      return res.status(200).json(processingProduct);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch processing product' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { cuttingCost, embroideryCost, packagingCost, otherProcessingCosts, ...rest } = req.body;
      const processingProduct = await ProcessingProduct.findByIdAndUpdate(id, { ...rest, cuttingCost, embroideryCost, packagingCost, otherProcessingCosts }, { new: true, runValidators: true });
      if (!processingProduct) {
        return res.status(404).json({ error: 'Processing product not found' });
      }
      return res.status(200).json(processingProduct);
    } catch (error) {
      return res.status(400).json({ error: 'Processing product update failed' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const processingProduct = await ProcessingProduct.findByIdAndDelete(id);
      if (!processingProduct) {
        return res.status(404).json({ error: 'Processing product not found' });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ error: 'Failed to delete processing product' });
    }
  }

  res.status(405).end();
}

import dbConnect from '@/lib/dbConnect';
import ProcessingProduct from '@/models/ProcessingProduct';
import Material from '@/models/Material';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Employee from '@/models/Employee';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const processingProducts = await ProcessingProduct.find()
        .populate('purchasedProduct')
        .populate('cuttingStaff')
        .populate('embroideryStaff')
        .populate('packagingStaff')
        .populate('category')
        .populate('subCategory');
      return res.status(200).json(processingProducts);
    } catch (error) {
      console.error('Error fetching processing products:', error);
      return res.status(500).json({ error: 'Failed to fetch processing products', details: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { cuttingCost, embroideryCost, packagingCost, otherProcessingCosts, ...rest } = req.body;
      const processingProduct = await ProcessingProduct.create({ ...rest, cuttingCost, embroideryCost, packagingCost, otherProcessingCosts });
      return res.status(201).json(processingProduct);
    } catch (error) {
      return res.status(400).json({ error: 'Processing product creation failed' });
    }
  }

  res.status(405).end();
}

import dbConnect from '@/lib/dbConnect';
import FinishedProduct from '@/models/FinishedProduct';
import ProcessingProduct from '@/models/ProcessingProduct'; // Import ProcessingProduct model
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const finishedProducts = await FinishedProduct.find()
        .populate('processingProduct')
        .populate('category')
        .populate('subCategory');
      return res.status(200).json(finishedProducts);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch finished products', details: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const finishedProduct = await FinishedProduct.create(req.body);

      // Update the status of the associated ProcessingProduct to 'Completed'
      await ProcessingProduct.findByIdAndUpdate(
        finishedProduct.processingProduct,
        { status: 'Completed' },
        { new: true }
      );

      return res.status(201).json(finishedProduct);
    } catch (error) {
      return res.status(400).json({ error: 'Finished product creation failed' });
    }
  }

  res.status(405).end();
}
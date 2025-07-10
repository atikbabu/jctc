import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import FinishedGood from '@/models/FinishedGood';
import FinishedProduct from '@/models/FinishedProduct'; // Import FinishedProduct model
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'material_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const finishedGoods = await FinishedGood.find()
        .populate({ path: 'product', strictPopulate: false })
        .populate({ path: 'category', strictPopulate: false })
        .populate({ path: 'subCategory', strictPopulate: false });

      // Filter out finished goods where the product population failed (i.e., product is null or not populated correctly)
      const validFinishedGoods = finishedGoods.filter(fg => fg.product && fg.product._id);

      return res.status(200).json({ data: validFinishedGoods });
    } catch (error) {
      console.error('Error fetching finished goods:', error);
      return res.status(500).json({ error: 'Failed to fetch finished goods', details: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { finishedProduct: finishedProductId, quantity, cost, size } = req.body;

      // Fetch the FinishedProduct to get its category and subCategory
      const finishedProduct = await FinishedProduct.findById(finishedProductId);
      if (!finishedProduct) {
        return res.status(404).json({ error: 'Finished Product not found' });
      }

      // Check if a finished good with the same product and size already exists
      let finishedGood = await FinishedGood.findOne({ product: finishedProductId, size });

      if (finishedGood) {
        // If it exists, update the quantity
        finishedGood.quantity += quantity;
        finishedGood.cost = cost; // Update cost as well, or handle as per business logic
        await finishedGood.save();
        return res.status(200).json(finishedGood);
      } else {
        // If it doesn't exist, create a new one
        const newFinishedGood = await FinishedGood.create({
          product: finishedProductId,
          quantity,
          cost,
          size,
          category: finishedProduct.category, // Carry over category from FinishedProduct
          subCategory: finishedProduct.subCategory, // Carry over subCategory from FinishedProduct
        });
        return res.status(201).json(newFinishedGood);
      }
    } catch (error) {
      console.error('Error creating finished good:', error);
      return res.status(400).json({ error: 'Finished good creation failed', details: error.message });
    }
  }

  res.status(405).end();
}

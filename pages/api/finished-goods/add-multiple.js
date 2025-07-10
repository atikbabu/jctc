import dbConnect from '@/lib/dbConnect';
import FinishedGood from '@/models/FinishedGood';
import FinishedProduct from '@/models/FinishedProduct';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'material_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Invalid request body: items array is required.' });
      }

      const createdFinishedGoods = [];

      for (const item of items) {
        const { finishedProduct: finishedProductId, quantity, cost, size } = item;

        // Fetch the FinishedProduct to get its category and subCategory
        const finishedProduct = await FinishedProduct.findById(finishedProductId);
        if (!finishedProduct) {
          console.warn(`Finished Product with ID ${finishedProductId} not found. Skipping.`);
          continue; // Skip this item if finished product not found
        }

        let finishedGood = await FinishedGood.findOne({ product: finishedProductId, size });

        if (finishedGood) {
          // If it exists, update the quantity
          finishedGood.quantity += quantity;
          finishedGood.cost = cost; // Update cost as well, or handle as per business logic
          await finishedGood.save();
          createdFinishedGoods.push(finishedGood);
        } else {
          // If it doesn't exist, create a new one
          const newFinishedGood = await FinishedGood.create({
            product: finishedProductId,
            quantity,
            cost,
            size, // Save the size
            category: finishedProduct.category,
            subCategory: finishedProduct.subCategory,
          });
          createdFinishedGoods.push(newFinishedGood);
        }
      }

      return res.status(201).json(createdFinishedGoods);
    } catch (error) {
      console.error('Error creating finished goods:', error);
      return res.status(400).json({ error: 'Finished goods creation failed', details: error.message });
    }
  }

  res.status(405).end();
}

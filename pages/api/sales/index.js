import dbConnect from '@/lib/dbConnect';
import Sale from '@/models/Sale';
import FinishedGood from '@/models/FinishedGood'; // Import FinishedGood model

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { items, total, paymentMethod, customerId } = req.body;

      // Update FinishedGood inventory
      for (const item of items) {
        const { finishedGoodId, quantity } = item; // Use finishedGoodId

        // Find the finished good
        const finishedGood = await FinishedGood.findById(finishedGoodId);

        if (!finishedGood) {
          return res.status(400).json({ error: `Finished Good not found: ${finishedGoodId}` });
        }

        if (finishedGood.quantity < quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${finishedGood.product.finishedCode} (Size: ${finishedGood.size})` });
        }

        // Decrement the quantity for the specific finished good
        await FinishedGood.findByIdAndUpdate(
          finishedGoodId,
          { $inc: { quantity: -quantity } },
          { new: true }
        );
      }

      const newSale = await Sale.create({
        items,
        total,
        paymentMethod,
        customerId: customerId || null,
        createdAt: new Date()
      });

      res.status(201).json(newSale);
    } catch (err) {
      console.error('❌ Sale POST error:', err);
      res.status(500).json({ error: 'Failed to create sale' });
    }
  } else if (req.method === 'GET') {
    const sales = await Sale.find().sort({ createdAt: -1 }).populate('items.finishedGood');
    res.status(200).json(sales);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}


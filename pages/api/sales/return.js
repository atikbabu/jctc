// /pages/api/sales/return.js
import dbConnect from '@/lib/dbConnect';
import Sale from '@/models/Sale';
import Production from '@/models/Production';
import ReturnLog from '@/models/ReturnLog';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { saleId, item, reason } = req.body;

      // Step 1: Load sale
      const sale = await Sale.findById(saleId);
      if (!sale) return res.status(404).json({ error: 'Sale not found' });

      // Step 2: Check if item already returned
      const alreadyReturned = sale.returnedItems?.find(i => i.productName === item.productName);
      if (alreadyReturned) {
        return res.status(400).json({ error: 'Item already returned' });
      }

      // Step 3: Log return
      await ReturnLog.create({
        saleId,
        productName: item.productName,
        quantity: item.quantity,
        reason,
        returnedAt: new Date()
      });

      // Step 4: Update sale to include returnedItems
      sale.returnedItems = [...(sale.returnedItems || []), { ...item, reason }];
      await sale.save();

      // Step 5: Update stock back in production
      const product = await Production.findOne({ productName: item.productName });
      if (!product) return res.status(404).json({ error: 'Product not found' });

      product.quantityProduced += item.quantity;
      await product.save();

      return res.status(200).json({ message: 'Item returned successfully.' });
    } catch (err) {
      console.error('Return error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

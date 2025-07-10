import dbConnect from '@/lib/dbConnect';
import PurchaseOrder from '@/models/PurchaseOrder';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';
import Material from '@/models/Material';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !['admin', 'material_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  await dbConnect();

  if (req.method === 'GET') {
    try {
      const purchaseOrders = await PurchaseOrder.find({})
        .populate('vendor')
        .populate('createdBy', 'name');
      return res.status(200).json(purchaseOrders);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      return res.status(500).json({ error: 'Failed to fetch purchase orders' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { items, ...rest } = req.body;
      let totalAmount = 0;

      const processedItems = items.map(item => {
        const itemTotalPrice = item.quantity * item.unitPrice;
        totalAmount += itemTotalPrice;
        return { ...item, totalPrice: itemTotalPrice };
      });

      const purchaseOrder = await PurchaseOrder.create({
        ...rest,
        items: processedItems,
        totalAmount,
        createdBy: new mongoose.Types.ObjectId(session.user.id),
      });

      // Increment material quantities
      for (const item of processedItems) {
        console.log(`Attempting to update material: ${item.materialId} with quantity: ${item.quantity}`);
        await Material.findByIdAndUpdate(
          item.materialId,
          { $inc: { quantity: item.quantity } },
          { new: true }
        );
      }
      return res.status(201).json(purchaseOrder);
    } catch (error) {
      console.error('Error creating purchase order:', error);
      return res.status(400).json({ error: 'Purchase order creation failed', details: error.message });
    }
  }

  res.status(405).end();
}

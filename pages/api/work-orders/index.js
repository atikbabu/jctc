
import dbConnect from '../../../lib/dbConnect';
import WorkOrder from '../../../models/WorkOrder';
import Material from '../../../models/Material';
import Production from '../../../models/Production';
import ProcessedGood from '../../../models/ProcessedGood';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const workOrders = await WorkOrder.find({}).populate('product').populate('stages');
        res.status(200).json({ success: true, data: workOrders });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case 'POST':
      try {
        const { product: productId, quantity, stages } = req.body;

        // 1. Find the production recipe for the product
        const productionRecipe = await Production.findOne({ productName: productId });
        if (!productionRecipe) {
          return res.status(404).json({ success: false, error: "Production recipe not found for this product." });
        }

        // 2. Calculate total raw materials needed
        const materialsNeeded = productionRecipe.rawMaterials.map(m => ({
          material: m.materialId,
          quantity: m.quantity * quantity
        }));

        // 3. Check for sufficient stock
        for (const item of materialsNeeded) {
          const material = await Material.findById(item.material);
          if (!material || material.quantityInStock < item.quantity) {
            return res.status(400).json({ success: false, error: `Insufficient stock for ${material?.name || 'a material'}.` });
          }
        }

        // 4. Deduct materials from inventory
        const materialsUsed = [];
        for (const item of materialsNeeded) {
          await Material.findByIdAndUpdate(item.material, { $inc: { quantityInStock: -item.quantity } });
          materialsUsed.push({ material: item.material, quantity: item.quantity });
        }
        
        // 5. Create the work order
        const lastOrder = await WorkOrder.findOne().sort({ createdAt: -1 });
        const nextOrderNumber = lastOrder ? parseInt(lastOrder.orderNumber) + 1 : 1;
        
        const newOrderData = {
          orderNumber: String(nextOrderNumber).padStart(5, '0'),
          product: productId,
          quantity,
          stages,
          status: 'In Progress', // Set status to In Progress
          currentStage: stages[0], // Set the first stage as the current one
          rawMaterialsUsed: materialsUsed,
          // We can also calculate and store the total cost here later
        };

        const workOrder = await WorkOrder.create(newOrderData);

        // Create initial ProcessedGood entry
        await ProcessedGood.create({
          workOrder: workOrder._id,
          product: productId,
          quantity: quantity,
          currentStage: stages[0],
        });

        res.status(201).json({ success: true, data: workOrder });

      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}

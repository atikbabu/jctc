
import dbConnect from '../../../../lib/dbConnect';
import WorkOrder from '../../../../models/WorkOrder';
import FinishedGood from '../../../../models/FinishedGood';
import Material from '../../../../models/Material';
import ProcessedGood from '../../../../models/ProcessedGood';
import Production from '../../../../models/Production';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !['admin', 'production_operator'].includes(session.user.role)) {
    return res.status(403).json({ error: 'Access Denied' });
  }

  const { method } = req;
  const { id } = req.query;

  if (method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  await dbConnect();

  try {
    const workOrder = await WorkOrder.findById(id).populate('stages').populate({ path: 'rawMaterialsUsed.material', model: 'Material' });
    if (!workOrder) {
      return res.status(404).json({ success: false, error: 'Work Order not found' });
    }

    const currentStageIndex = workOrder.stages.findIndex(
      (stage) => stage._id.toString() === workOrder.currentStage.toString()
    );

    if (currentStageIndex === -1) {
        return res.status(400).json({ success: false, error: 'Current stage not found in work order stages' });
    }

    const nextStageIndex = currentStageIndex + 1;

    if (nextStageIndex < workOrder.stages.length) {
      // Move to the next stage
      workOrder.currentStage = workOrder.stages[nextStageIndex]._id;
      // Update ProcessedGood entry to reflect new stage
      await ProcessedGood.findOneAndUpdate(
        { workOrder: workOrder._id },
        { currentStage: workOrder.stages[nextStageIndex]._id }
      );
    } else {
      // This was the last stage, mark as completed
      workOrder.currentStage = null;
      workOrder.status = 'Completed';

      // Remove ProcessedGood entry
      await ProcessedGood.deleteOne({ workOrder: workOrder._id });

      // Calculate total cost of finished good
      let totalCost = 0;
      for (const item of workOrder.rawMaterialsUsed) {
        totalCost += item.quantity * item.material.costPerUnit;
      }

      // Fetch production recipe for labor and overhead costs
      const productionRecipe = await Production.findOne({ productName: workOrder.product._id });
      if (productionRecipe) {
        totalCost += (productionRecipe.laborCostPerUnit * workOrder.quantity);
        totalCost += (productionRecipe.overheadCostPerUnit * workOrder.quantity);
      }

      // Create FinishedGood entry
      await FinishedGood.create({
        product: workOrder.product,
        quantity: workOrder.quantity,
        cost: totalCost,
      });
    }

    await workOrder.save();
    res.status(200).json({ success: true, data: workOrder });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

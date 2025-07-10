
import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Paused', 'Completed', 'Cancelled'], default: 'Pending' },
  currentStage: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionStage' },
  stages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductionStage' }],
  rawMaterialsUsed: [{ 
    material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    quantity: Number 
  }],
  totalCost: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.WorkOrder || mongoose.model('WorkOrder', workOrderSchema);

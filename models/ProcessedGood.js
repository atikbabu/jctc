
import mongoose from 'mongoose';

const processedGoodSchema = new mongoose.Schema({
  workOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkOrder', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  quantity: { type: Number, required: true },
  currentStage: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionStage', required: true },
}, { timestamps: true });

export default mongoose.models.ProcessedGood || mongoose.model('ProcessedGood', processedGoodSchema);

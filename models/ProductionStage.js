
import mongoose from 'mongoose';

const productionStageSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  costPerUnit: { type: Number, default: 0 }, // Cost associated with completing one unit of this stage
}, { timestamps: true });

export default mongoose.models.ProductionStage || mongoose.model('ProductionStage', productionStageSchema);

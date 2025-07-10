// models/Material.js
import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String, default: 'pcs' },
  pricePerUnit: { type: Number, default: 0 },
  reorderLevel: { type: Number, default: 0 }, // Added reorderLevel field
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
}, { timestamps: true });

export default mongoose.models.Material || mongoose.model('Material', MaterialSchema);

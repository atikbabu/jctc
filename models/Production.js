// /models/Production.js

import mongoose from 'mongoose';

const productionSchema = new mongoose.Schema({
  productName: String,
  laborCostPerUnit: { type: Number, default: 0 },
  overheadCostPerUnit: { type: Number, default: 0 },
  rawMaterials: Array,
  image: String, // ✅ Add this line to store image URL
}, { timestamps: true });

export default mongoose.models.Production || mongoose.model('Production', productionSchema);

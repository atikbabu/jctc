
import mongoose from 'mongoose';

const finishedGoodSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'FinishedProduct', required: true },
  quantity: { type: Number, required: true },
  size: { type: String, required: true }, // Added size field
  cost: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
  },
}, { timestamps: true });

export default mongoose.models.FinishedGood || mongoose.model('FinishedGood', finishedGoodSchema);

import mongoose from 'mongoose';

const ReturnLogSchema = new mongoose.Schema({
  finishedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinishedProduct',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  reason: {
    type: String,
    required: true,
  },
  returnDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.models.ReturnLog || mongoose.model('ReturnLog', ReturnLogSchema);
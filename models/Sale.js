// /models/Sale.js
import mongoose from 'mongoose';

const SaleSchema = new mongoose.Schema({
  items: [
    {
      finishedGood: { type: mongoose.Schema.Types.ObjectId, ref: 'FinishedProduct', required: true },
      size: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    }
  ],
  total: Number,
  paymentMethod: String,
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  createdAt: { type: Date, default: Date.now },
  returnedItems: { type: Array, default: [] },
});

export default mongoose.models.Sale || mongoose.model('Sale', SaleSchema);

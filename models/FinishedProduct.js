import mongoose from 'mongoose';

const FinishedProductSchema = new mongoose.Schema({
  processingProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessingProduct',
    required: true,
  },
  finishedCode: {
    type: String,
    required: true,
    unique: true,
  },
  finishedDate: {
    type: Date,
    required: true,
  },
  productType: {
    type: String,
    enum: ['Formal', 'Text', 'Other'], // Example types, adjust as needed
    default: 'Other',
  },
  sizes: [
    {
      size: { type: String, required: true }, // e.g., XXL, XL, L, M, S
      quantity: { type: Number, required: true, min: 0 },
    },
  ],
  imageUrl: {
    type: String, // URL to the uploaded image
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  manpowerChargePerUnit: {
    type: Number,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
  },
}, { timestamps: true });

export default mongoose.models.FinishedProduct || mongoose.model('FinishedProduct', FinishedProductSchema);

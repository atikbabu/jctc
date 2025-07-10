import mongoose from 'mongoose';

const ProcessingProductSchema = new mongoose.Schema({
  purchasedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material', // Assuming 'Material' is the model for purchased products/raw materials
    required: true,
  },
  processingCode: {
    type: String,
    required: true,
    unique: true,
  },
  cuttingStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
  },
  embroideryStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
  },
  packagingStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null,
  },
  cuttingCost: {
    type: Number,
    default: 0,
  },
  embroideryCost: {
    type: Number,
    default: 0,
  },
  packagingCost: {
    type: Number,
    default: 0,
  },
  otherProcessingCosts: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Completed'], // Added 'Completed' status
    default: 'Active',
  },
  notes: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String, // URL to the uploaded image
    default: '',
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

export default mongoose.models.ProcessingProduct || mongoose.model('ProcessingProduct', ProcessingProductSchema);

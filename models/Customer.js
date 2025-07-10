// /models/Customer.js
import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // sparse allows nulls but enforces uniqueness for non-nulls
  phone: { type: String, required: true },
  address: {
    street: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  customerType: { type: String, enum: ['Individual', 'Business'], default: 'Individual' },
  companyName: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
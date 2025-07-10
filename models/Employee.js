import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  role: { type: String, required: true }, // e.g., 'Cutting Staff', 'Embroidery Staff', 'Packaging Staff', 'Admin'
  rank: { type: String }, // e.g., 'Sewing Machine Operator (Grade-I)'
  contactNumber: { type: String },
  address: { type: String },
  dateOfJoining: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

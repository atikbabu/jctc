import mongoose from 'mongoose';

const SalaryStructureSchema = new mongoose.Schema({
  rank: { type: String, required: true, unique: true },
  basicPay: { type: Number, required: true, min: 0 },
  houseRentAllowance: { type: Number, required: true, min: 0 },
  medicalAllowance: { type: Number, required: true, min: 0 },
  conveyanceAllowance: { type: Number, required: true, min: 0 },
  overtimeAllowancePerHour: { type: Number, required: true, min: 0 },
  maxSkillsBonus: { type: Number, required: true, min: 0 },
}, { timestamps: true });

export default mongoose.models.SalaryStructure || mongoose.model('SalaryStructure', SalaryStructureSchema);

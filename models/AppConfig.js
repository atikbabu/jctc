import mongoose from 'mongoose';

const AppConfigSchema = new mongoose.Schema({
  softwareTitle: {
    type: String,
    default: 'JC&TC ERP',
  },
  logoUrl: {
    type: String,
    default: '/next.svg', // Default logo
  },
  timezone: {
    type: String,
    default: 'Asia/Dhaka', // Default timezone
  },
  displayType: {
    type: String,
    enum: ['logo', 'text'],
    default: 'logo', // Default to displaying logo
  },
}, { timestamps: true });

export default mongoose.models.AppConfig || mongoose.model('AppConfig', AppConfigSchema);

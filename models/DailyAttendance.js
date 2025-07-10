import mongoose from 'mongoose';

const DailyAttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  checkInTime: {
    type: String,
    required: true,
  },
  checkOutTime: {
    type: String,
    required: true,
  },
  overtimeHours: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.models.DailyAttendance || mongoose.model('DailyAttendance', DailyAttendanceSchema);

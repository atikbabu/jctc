import mongoose from 'mongoose';

const DailyProductionLogSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  processingProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProcessingProduct', // Link to ProcessingProduct
    required: true,
  },
  productionStage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductionStage', // Link to ProductionStage
    required: true,
  },
  unitsCompleted: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

export default mongoose.models.DailyProductionLog || mongoose.model('DailyProductionLog', DailyProductionLogSchema);
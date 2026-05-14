import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'IdRequest', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['online', 'cashier'], required: true },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  providerReference: String,
  paidAt: Date
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);

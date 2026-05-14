import mongoose from 'mongoose';

const validationLogSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'IdRequest', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['APPROVED', 'REJECTED'], required: true },
  remarks: String,
  checkedDocuments: {
    photo1x1: { type: Boolean, default: false },
    signature: { type: Boolean, default: false },
    scholarDoc: { type: Boolean, default: false },
    lossReasonDoc: { type: Boolean, default: false }
  }
}, { timestamps: true });

export const ValidationLog = mongoose.model('ValidationLog', validationLogSchema);

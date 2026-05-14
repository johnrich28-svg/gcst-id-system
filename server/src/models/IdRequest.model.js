import mongoose from 'mongoose';

const idRequestSchema = new mongoose.Schema({
  referenceNumber: { type: String, unique: true, required: true },
  type: { 
    type: String, 
    enum: ['normal', 'scholar', 'rush', 'lost'], 
    required: true 
  },
  status: {
    type: String,
    enum: [
      'PENDING', 
      'UNDER_REVIEW', 
      'FOR_PAYMENT', 
      'PAID', 
      'APPROVED', 
      'REJECTED', 
      'GENERATED', 
      'READY_FOR_RELEASE', 
      'RELEASED'
    ],
    default: 'PENDING'
  },
  personalInfo: {
    fullName: String,
    studentId: String,
    email: String,
    contactNo: String,
    course: {
      type: String,
      enum: ['BSIT', 'BSCS', 'BEED', 'BSED', 'BSCRIM', 'BSTM', 'BSA', 'BSBA-MM', 'BSBA-OM']
    },
    yearLevel: String,
    section: String,
    address: String,
    guardianName: String,
    guardianContact: String
  },
  uploads: {
    photo1x1: String,
    signature: String,
    scholarDoc: String,
    lossReasonDoc: String
  },
  validation: {
    isValidated: { type: Boolean, default: false },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    validatedAt: Date
  },
  payment: {
    required: { type: Boolean, default: false },
    amount: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['NOT_REQUIRED', 'PENDING', 'PAID'], 
      default: 'NOT_REQUIRED' 
    },
    transactionId: String
  },
  schedule: {
    releaseDate: Date,
    batchGroup: String
  },
  release: {
    releasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    releasedAt: { type: Date, default: null }
  }
}, { timestamps: true });

export const IdRequest = mongoose.model('IdRequest', idRequestSchema);

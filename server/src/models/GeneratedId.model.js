import mongoose from 'mongoose';

const generatedIdSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'IdRequest', required: true },
  studentId: String,
  fullName: String,
  course: String,
  yearLevel: String,
  section: String,
  address: String,
  guardianName: String,
  guardianContact: String,
  photoUrl: String,
  signatureUrl: String,
  frontPdfPath: String,
  backPdfPath: String,
  issuedAt: { type: Date, default: Date.now },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', default: null },
  printed: { type: Boolean, default: false }
});

export const GeneratedId = mongoose.model('GeneratedId', generatedIdSchema);

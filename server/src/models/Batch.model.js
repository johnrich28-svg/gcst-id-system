import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true, unique: true },
  type: { type: String, enum: ['normal', 'scholar', 'rush', 'lost'], required: true },
  // Only populated for normal/scholar batches — the class group they represent
  yearLevel: { type: String, default: null },
  section: { type: String, default: null },
  course: { type: String, default: null },
  status: { type: String, enum: ['PENDING', 'RELEASED'], default: 'PENDING' },
  releaseDate: { type: Date },
  requestIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'IdRequest' }],
  quota: { type: Number, required: true }
}, { timestamps: true });

export const Batch = mongoose.model('Batch', batchSchema);

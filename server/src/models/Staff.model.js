import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  pin: { type: String, required: true }, // hashed
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

staffSchema.methods.comparePin = async function(pin) {
  return await bcrypt.compare(String(pin), this.pin);
};

export const Staff = mongoose.model('Staff', staffSchema);

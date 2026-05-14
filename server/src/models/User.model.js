import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin', enum: ['admin', 'superadmin'] }
}, { timestamps: true });

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);

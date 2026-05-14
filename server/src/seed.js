import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User.model.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const adminEmail = 'admin@gcst.edu.ph';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const admin = new User({
      email: adminEmail,
      passwordHash,
      name: 'Administrator',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin created successfully');
    console.log('Email: admin@gcst.edu.ph');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

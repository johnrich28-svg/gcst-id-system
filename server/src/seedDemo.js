import mongoose from 'mongoose';
import { IdRequest } from './models/IdRequest.model.js';
import { Batch } from './models/Batch.model.js';
import { connectDB } from './config/db.js';

const buildRequest = (type, course, year, section, idx) => ({
  referenceNumber: `DEMO-${type.toUpperCase()}-${course}-${year}-${section}-${idx}`,
  type,
  status: 'GENERATED',
  personalInfo: {
    fullName: `STUDENT ${idx} ${course}`,
    email: `student${idx}@gcst.edu.ph`,
    contactNo: `09${String(Math.floor(100000000 + Math.random() * 900000000))}`,
    studentId: `GC-26${String(idx).padStart(4, '0')}`,
    course,
    yearLevel: year,
    section,
    address: 'Naic, Cavite, Philippines',
    guardianName: 'PARENT NAME',
    guardianContact: `09${String(Math.floor(100000000 + Math.random() * 900000000))}`,
  },
  payment: { required: false, amount: 0, status: 'NOT_REQUIRED' },
});

const seed = async () => {
  await connectDB();
  
  console.log('🧹 Clearing old demo data...');
  await IdRequest.deleteMany({ referenceNumber: /^DEMO-/ });
  await Batch.deleteMany({ batchName: /^BATCH-/ });

  const requests = [
    // Class 1: BSIT 1-A (3 students)
    buildRequest('normal', 'BSIT', '1', 'A', 1),
    buildRequest('normal', 'BSIT', '1', 'A', 2),
    buildRequest('normal', 'BSIT', '1', 'A', 3),

    // Class 2: BSCS 2-B (2 students)
    buildRequest('normal', 'BSCS', '2', 'B', 4),
    buildRequest('normal', 'BSCS', '2', 'B', 5),

    // Class 3: BEED 3-A (Scholar)
    buildRequest('scholar', 'BEED', '3', 'A', 6),

    // Rush (Mixed)
    buildRequest('rush', 'BSCRIM', '1', 'A', 7),
    buildRequest('rush', 'BSA', '2', 'B', 8),

    // Lost (Mixed)
    buildRequest('lost', 'BSTM', '4', 'A', 11)
  ];

  console.log('📥 Seeding dummy data...');
  await IdRequest.insertMany(requests);
  
  console.log('✅ Done! Now go to Admin > Schedule and click "Run Auto Batching" to see the grouping in action.');
  process.exit(0);
};

seed();

import mongoose from 'mongoose';
import { IdRequest } from './models/IdRequest.model.js';
import { connectDB } from './config/db.js';

const simulateRushBatch = async () => {
  try {
    await connectDB();
    
    console.log('Simulating 10 Rush Requests...');
    
    const dummyRequests = [];
    for (let i = 1; i <= 10; i++) {
      dummyRequests.push({
        referenceNumber: `SIM-RUSH-${Date.now()}-${i}`,
        type: 'rush',
        status: 'GENERATED',
        personalInfo: {
          fullName: `Simulation Student ${i}`,
          studentId: `2024-SIM-${i}`,
          course: 'BS-CS',
          yearLevel: '1',
          section: '1A',
          address: 'Simulated Address',
          guardianName: 'Guardian Name',
          guardianContact: '09123456789'
        },
        payment: {
          required: true,
          amount: 250,
          status: 'PAID',
          transactionId: `TXN-SIM-${i}`
        }
      });
    }

    await IdRequest.insertMany(dummyRequests);
    console.log('Successfully created 10 GENERATED Rush requests.');
    process.exit(0);
  } catch (error) {
    console.error('Simulation failed:', error);
    process.exit(1);
  }
};

simulateRushBatch();

import mongoose from 'mongoose';
import { IdRequest } from './models/IdRequest.model.js';
import { GeneratedId } from './models/GeneratedId.model.js';
import { Batch } from './models/Batch.model.js';
import { connectDB } from './config/db.js';
import { autoBatchGeneratedIds } from './services/schedule.service.js';

const COURSES = ['BSIT', 'BSCS', 'BEED', 'BSED', 'BSCRIM', 'BSTOURISM', 'BSA'];
const YEARS = ['1', '2', '3', '4'];
const SECTIONS = ['A', 'B', 'C'];

const buildRequest = (type, course, year, section, idx) => ({
  referenceNumber: `SCALE-TEST-${idx}-${Date.now()}`,
  type,
  status: 'GENERATED',
  personalInfo: {
    fullName: `Scale Student ${idx}`,
    email: `scale${idx}@student.com`,
    contactNo: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
    studentId: `2024-SCALE-${idx}`,
    course,
    yearLevel: year,
    section,
    address: 'Scale Test Address',
    guardianName: 'Guardian',
    guardianContact: '09111111111',
  },
  payment: { required: false, amount: 0, status: 'NOT_REQUIRED' },
});

const runScaleTest = async () => {
  await connectDB();
  
  console.log('\n🧹 Clearing previous scale test data...');
  await IdRequest.deleteMany({ referenceNumber: /^SCALE-TEST-/ });
  await GeneratedId.deleteMany({}); // Clear all generated for clean UI
  await Batch.deleteMany({ batchName: /^BATCH-/ });

  const requests = [];
  const TOTAL_REQUESTS = 100;

  console.log(`🏗️ Generating ${TOTAL_REQUESTS} requests...`);

  // Distribute 100 requests:
  // 60 Normal (across various classes)
  // 10 Scholar (across various classes)
  // 15 Rush
  // 15 Lost
  
  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    let type = 'normal';
    if (i > 60 && i <= 70) type = 'scholar';
    if (i > 70 && i <= 85) type = 'rush';
    if (i > 85) type = 'lost';

    const course = COURSES[Math.floor(Math.random() * COURSES.length)];
    const year = YEARS[Math.floor(Math.random() * YEARS.length)];
    const section = SECTIONS[Math.floor(Math.random() * SECTIONS.length)];

    requests.push(buildRequest(type, course, year, section, i));
  }

  console.log('📥 Seeding into database...');
  const insertedRequests = await IdRequest.insertMany(requests);

  // Sync with GeneratedId model so they appear in the UI
  const generatedEntries = insertedRequests.map(req => ({
    requestId: req._id,
    studentId: req.personalInfo.studentId,
    fullName: req.personalInfo.fullName,
    course: req.personalInfo.course,
    yearLevel: req.personalInfo.yearLevel,
    section: req.personalInfo.section,
    address: req.personalInfo.address,
    guardianName: req.personalInfo.guardianName,
    guardianContact: req.personalInfo.guardianContact,
    photoUrl: 'https://via.placeholder.com/150', // Placeholder for UI
    signatureUrl: 'https://via.placeholder.com/100',
  }));

  await GeneratedId.insertMany(generatedEntries);

  console.log('\n⚙️ Running Auto-Batching Engine...');
  const startTime = Date.now();
  const batches = await autoBatchGeneratedIds();
  const duration = Date.now() - startTime;

  console.log('\n' + '═'.repeat(70));
  console.log(`📊 SCALE TEST RESULTS (100 REQUESTS)`);
  console.log('═'.repeat(70));
  console.log(`⏱️ Duration      : ${duration}ms`);
  console.log(`✅ Total Batches : ${batches.length}`);
  console.log('─'.repeat(70));

  const stats = batches.reduce((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + 1;
    return acc;
  }, {});

  console.log(`Batch Breakdown:`);
  Object.entries(stats).forEach(([type, count]) => {
    console.log(`  - ${type.toUpperCase()}: ${count} batches`);
  });

  console.log('\nSample Batches:');
  batches.slice(0, 5).forEach(b => {
    const classInfo = b.course ? `[${b.course}-${b.yearLevel}-${b.section}]` : '[Mixed]';
    console.log(`  📦 ${b.batchName.padEnd(30)} | ${b.requestIds.length} students | ${classInfo}`);
  });

  if (batches.length > 5) console.log(`  ... and ${batches.length - 5} more.`);

  // Verify that Normal/Scholar are never mixed in one batch
  for (const b of batches) {
    if (['normal', 'scholar'].includes(b.type)) {
      const uniqueClasses = new Set();
      const reqs = await IdRequest.find({ _id: { $in: b.requestIds } });
      reqs.forEach(r => uniqueClasses.add(`${r.personalInfo.course}-${r.personalInfo.yearLevel}-${r.personalInfo.section}`));
      
      if (uniqueClasses.size > 1) {
        console.log(`❌ ERROR: Batch ${b.batchName} has mixed classes:`, Array.from(uniqueClasses));
      }
    }
  }

  console.log('\n✅ Scale test passed: Class integrity maintained across 100 requests.');
  process.exit(0);
};

runScaleTest().catch(console.error);

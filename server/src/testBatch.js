/**
 * Batch Grouping Test
 * -------------------
 * Inserts mock GENERATED requests for all types and verifies:
 *  - rush/lost  → batched together (by type only)
 *  - normal/scholar → batched separately per year + section + course
 *
 * Run: node src/testBatch.js
 */

import mongoose from 'mongoose';
import { IdRequest } from './models/IdRequest.model.js';
import { Batch } from './models/Batch.model.js';
import { connectDB } from './config/db.js';
import { autoBatchGeneratedIds } from './services/schedule.service.js';

// ─── School courses ────────────────────────────────────────────────────────────
const COURSES   = ['BSIT', 'BSCS', 'BEED', 'BSED', 'BSCRIM', 'BSTOURISM', 'BSA'];
const YEARS     = ['1', '2', '3', '4'];
const SECTIONS  = ['A', 'B'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const buildRequest = (type, course, year, section, idx) => ({
  referenceNumber: `TEST-${type.toUpperCase()}-${course}-${year}-${section}-${Date.now()}-${idx}`,
  type,
  status: 'GENERATED',
  personalInfo: {
    fullName: `Test Student ${idx}`,
    email: `test${idx}@student.com`,
    contactNo: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
    studentId: `2024-${type.toUpperCase()}-${idx}`,
    course,
    yearLevel: year,
    section,
    address: 'Test Address',
    guardianName: 'Test Guardian',
    guardianContact: '09000000000',
  },
  payment: { required: false, amount: 0, status: 'NOT_REQUIRED' },
});

// ─── Seed data ────────────────────────────────────────────────────────────────
const buildTestData = () => {
  const requests = [];
  let idx = 1;

  // normal & scholar: different classes
  const classGroups = [
    { type: 'normal',  course: 'BSIT',   year: '1', section: 'A', count: 5 },
    { type: 'normal',  course: 'BSCS',   year: '2', section: 'B', count: 3 },
    { type: 'scholar', course: 'BSCRIM', year: '1', section: 'A', count: 4 },
  ];

  for (const grp of classGroups) {
    for (let i = 0; i < grp.count; i++, idx++) {
      requests.push(buildRequest(grp.type, grp.course, grp.year, grp.section, idx));
    }
  }

  // rush: mixed
  for (let i = 0; i < 5; i++, idx++) {
    requests.push(buildRequest('rush', rand(COURSES), rand(YEARS), rand(SECTIONS), idx));
  }

  // lost: mixed
  for (let i = 0; i < 5; i++, idx++) {
    requests.push(buildRequest('lost', rand(COURSES), rand(YEARS), rand(SECTIONS), idx));
  }

  return requests;
};

// ─── Main ────────────────────────────────────────────────────────────────────
const run = async () => {
  await connectDB();

  // Clean up any leftover test data
  console.log('\n🧹 Cleaning up previous test data...');
  await IdRequest.deleteMany({ referenceNumber: /^TEST-/ });
  await Batch.deleteMany({ batchName: /^BATCH-/ });

  // Insert fresh test data
  const testData = buildTestData();
  console.log(`📥 Inserting ${testData.length} test requests...`);
  await IdRequest.insertMany(testData);

  // Run the batcher
  console.log('\n⚙️  Running autoBatchGeneratedIds...\n');
  const batches = await autoBatchGeneratedIds();

  // ─── Report ──────────────────────────────────────────────────────────────
  console.log('═'.repeat(70));
  console.log(`✅ Batches created: ${batches.length}`);
  console.log('═'.repeat(70));

  for (const b of batches) {
    const tag = (b.type === 'normal' || b.type === 'scholar')
      ? `  [Year: ${b.yearLevel}]  [Section: ${b.section}]  [Course: ${b.course}]`
      : `  [Random pool — no class constraint]`;
    console.log(`\n📦 ${b.batchName}`);
    console.log(`   Type      : ${b.type.toUpperCase()}`);
    console.log(`   Requests  : ${b.requestIds.length}`);
    console.log(tag);
  }

  // ─── Verify expectations ─────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(70));
  console.log('🔍 Verification');
  console.log('─'.repeat(70));

  const rushBatches   = batches.filter(b => b.type === 'rush');
  const lostBatches   = batches.filter(b => b.type === 'lost');
  const normalBatches = batches.filter(b => b.type === 'normal');
  const scholarBatches= batches.filter(b => b.type === 'scholar');

  const check = (label, condition) =>
    console.log(`  ${condition ? '✅' : '❌'} ${label}`);

  check('Rush creates 1 batch',   rushBatches.length === 1);
  check('Lost creates 1 batch',   lostBatches.length === 1);
  check('Normal creates 2 separate batches (for BSIT and BSCS)',   normalBatches.length === 2);
  check('Scholar creates 1 separate batch (for BSCRIM)',  scholarBatches.length === 1);

  // Each normal/scholar batch should have distinct course+year+section
  const classBatchKeys = [...normalBatches, ...scholarBatches].map(b => `${b.type}|${b.course}|${b.yearLevel}|${b.section}`);
  const uniqueClassKeys = new Set(classBatchKeys);
  check('All class-based batches (normal/scholar) have unique grouping keys',
        uniqueClassKeys.size === (normalBatches.length + scholarBatches.length));

  // Clean up after test
  console.log('\n🧹 Cleaning up test data...');
  await IdRequest.deleteMany({ referenceNumber: /^TEST-/ });
  await Batch.deleteMany({ batchName: /^BATCH-/ });

  console.log('\n✅ Test complete.\n');
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

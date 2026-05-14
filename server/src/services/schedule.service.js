import { IdRequest } from '../models/IdRequest.model.js';
import { Batch } from '../models/Batch.model.js';
import { GeneratedId } from '../models/GeneratedId.model.js';
import fs from 'fs';

const QUOTAS = {
  rush: 10,
  normal: 50,
  scholar: 50,
  lost: 50
};

/**
 * Build the grouping key for a request.
 * - rush / lost  → group by type only (order doesn't matter, batch randomly)
 * - normal / scholar → group by type + yearLevel + section + course
 *   so that students from the same class are always released together
 */
const getGroupKey = (req) => {
  const { type, personalInfo } = req;
  if (type === 'rush' || type === 'lost') {
    return type;
  }
  const year    = (personalInfo?.yearLevel || 'UNKNOWN').trim().toUpperCase();
  const section = (personalInfo?.section   || 'UNKNOWN').trim().toUpperCase();
  const course  = (personalInfo?.course    || 'UNKNOWN').trim().toUpperCase();
  return `${type}|${year}|${section}|${course}`;
};

export const autoBatchGeneratedIds = async () => {
  const generatedRequests = await IdRequest.find({ status: 'GENERATED' });

  // Group requests using the key strategy above
  const groups = generatedRequests.reduce((acc, req) => {
    const key = getGroupKey(req);
    if (!acc[key]) acc[key] = [];
    acc[key].push(req);
    return acc;
  }, {});

  const createdBatches = [];

  for (const [key, requests] of Object.entries(groups)) {
    // Derive metadata from the key
    const parts = key.split('|');
    const type  = parts[0];
    const quota = QUOTAS[type];

    const isClassBatch = type === 'normal' || type === 'scholar';
    const yearLevel = isClassBatch ? parts[1] : null;
    const section   = isClassBatch ? parts[2] : null;
    const course    = isClassBatch ? parts[3] : null;

    if (requests.length > 0) {
      // For normal/scholar: name encodes course-year-section for clarity.
      // For rush/lost: use timestamp so names stay unique across runs.
      const batchName = `BATCH-${type.toUpperCase()}-${isClassBatch
        ? `${course}-${yearLevel}-${section}`
        : Date.now()}`;

      // Skip if a batch already exists for this class group (prevents duplicate key crash)
      const existing = await Batch.findOne({ batchName });
      if (existing) continue;

      const batch = new Batch({
        batchName,
        type,
        quota,
        yearLevel,
        section,
        course,
        requestIds: requests.slice(0, quota).map(r => r._id),
      });

      await batch.save();

      // Mark requests as ready for release
      await IdRequest.updateMany(
        { _id: { $in: batch.requestIds } },
        {
          status: 'READY_FOR_RELEASE',
          'schedule.batchGroup': batchName
        }
      );

      createdBatches.push(batch);
    }
  }

  return createdBatches;
};

export const getBatches = async (filters = {}) => {
  return await Batch.find(filters).populate('requestIds').sort({ createdAt: -1 });
};

export const setBatchReleaseDate = async (batchId, releaseDate) => {
  const batch = await Batch.findById(batchId);
  if (!batch) throw new Error('Batch not found');

  batch.releaseDate = releaseDate;
  await batch.save();

  // Update all requests in this batch
  await IdRequest.updateMany(
    { _id: { $in: batch.requestIds } },
    { 'schedule.releaseDate': releaseDate }
  );

  return batch;
};

export const releaseBatch = async (batchId) => {
  const batch = await Batch.findById(batchId);
  if (!batch) throw new Error('Batch not found');

  batch.status = 'RELEASED';
  await batch.save();

  await IdRequest.updateMany(
    { _id: { $in: batch.requestIds } },
    { status: 'RELEASED' }
  );

  return batch;
};

/**
 * Returns a list of file paths for all IDs in a batch
 */
export const getBatchPdfFiles = async (batchId) => {
  const batch = await Batch.findById(batchId);
  if (!batch) throw new Error('Batch not found');

  const generatedIds = await GeneratedId.find({
    requestId: { $in: batch.requestIds }
  });

  const files = [];
  generatedIds.forEach(id => {
    if (id.frontPdfPath && fs.existsSync(id.frontPdfPath)) {
      files.push({ path: id.frontPdfPath, name: `${id.fullName}_front.pdf` });
    }
    if (id.backPdfPath && fs.existsSync(id.backPdfPath)) {
      files.push({ path: id.backPdfPath, name: `${id.fullName}_back.pdf` });
    }
  });

  return { batchName: batch.batchName, files };
};

import { IdRequest } from '../models/IdRequest.model.js';
import { ValidationLog } from '../models/ValidationLog.model.js';
import * as idGeneratorService from './idGenerator.service.js';

export const validateRequest = async (requestId, adminId, validationData) => {
  const request = await IdRequest.findById(requestId);
  if (!request) throw new Error('Request not found');

  const { status, remarks, checkedDocuments } = validationData;

  // Create log
  const log = new ValidationLog({
    requestId,
    adminId,
    status,
    remarks,
    checkedDocuments
  });
  await log.save();

  // Update request
  request.status = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
  request.validation = {
    isValidated: true,
    validatedBy: adminId,
    validatedAt: new Date()
  };

  await request.save();

  // If approved, trigger ID generation
  if (status === 'APPROVED') {
    await idGeneratorService.generateIdCard(requestId);
  }

  return { request, log };
};

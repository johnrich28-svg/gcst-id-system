import { IdRequest } from '../models/IdRequest.model.js';
import { generateReference } from '../utils/generateReference.js';

export const createNewRequest = async (data, files) => {
  const refNo = generateReference();
  const isPaidType = ['rush', 'lost'].includes(data.type);
  
  // Parse personalInfo if it's sent as a string (common with form-data)
  const personalInfo = typeof data.personalInfo === 'string' 
    ? JSON.parse(data.personalInfo) 
    : data.personalInfo;

  const normalizedFullName = personalInfo.fullName?.trim().toUpperCase();
  const normalizedContactNo = personalInfo.contactNo?.trim();
  const normalizedEmail = personalInfo.email?.trim().toLowerCase();
  const normalizedGuardianContact = personalInfo.guardianContact?.trim();

  if (normalizedContactNo === normalizedGuardianContact) {
    throw new Error('Student contact number and Guardian contact number cannot be the same.');
  }

  // Duplicate Checks: Only for Normal, Scholar, and Rush. Lost IDs are exempt.
  if (data.type !== 'lost') {
    // 1. Strict Duplicate Check: Prevent multiple ACTIVE requests
    const existingActiveRequest = await IdRequest.findOne({
      $or: [
        { 'personalInfo.fullName': normalizedFullName, 'personalInfo.contactNo': normalizedContactNo },
        { 'personalInfo.email': normalizedEmail }
      ],
      status: { $nin: ['RELEASED', 'REJECTED'] }
    });

    if (existingActiveRequest) {
      let reason = "An active ID request already exists";
      if (existingActiveRequest.personalInfo.fullName === normalizedFullName && 
          existingActiveRequest.personalInfo.contactNo === normalizedContactNo) {
        reason = `An active request for "${normalizedFullName}" with contact "${normalizedContactNo}" already exists.`;
      } else if (existingActiveRequest.personalInfo.email === normalizedEmail) {
        reason = `An active request with the email "${normalizedEmail}" already exists.`;
      }
      throw new Error(`${reason} Please track your existing request or contact the registrar.`);
    }

    // 2. Normal/Scholar Restriction: Cannot apply for Normal/Scholar if they EVER had an ID released
    if (['normal', 'scholar'].includes(data.type)) {
      const previousReleased = await IdRequest.findOne({
        $or: [
          { 'personalInfo.fullName': normalizedFullName, 'personalInfo.contactNo': normalizedContactNo },
          { 'personalInfo.email': normalizedEmail }
        ],
        status: 'RELEASED'
      });

      if (previousReleased) {
        let identifier = previousReleased.personalInfo.fullName === normalizedFullName ? "this Name" : "this Email";
        throw new Error(`You already have a released ID associated with ${identifier}. If you lost it, please apply for a "Lost ID Replacement" instead.`);
      }
    }
  }

  // Update personalInfo with normalized values
  personalInfo.fullName = normalizedFullName;
  personalInfo.contactNo = normalizedContactNo;
  personalInfo.email = normalizedEmail;

  // Auto-generate student ID (Format: GC-YYXXXX) — sequential per year
  const yearSuffix = String(new Date().getFullYear()).slice(-2); // e.g. '26' for 2026
  const prefix = `GC-${yearSuffix}`;
  const latest = await IdRequest.findOne(
    { 'personalInfo.studentId': { $regex: `^${prefix}` } },
    { 'personalInfo.studentId': 1 }
  ).sort({ 'personalInfo.studentId': -1 });
  const lastSeq = latest ? parseInt(latest.personalInfo.studentId.replace(prefix, ''), 10) : 0;
  const nextSeq = String(lastSeq + 1).padStart(4, '0');
  personalInfo.studentId = `${prefix}${nextSeq}`;


  const request = new IdRequest({
    referenceNumber: refNo,
    type: data.type,
    status: isPaidType ? 'FOR_PAYMENT' : 'PENDING',
    personalInfo,
    uploads: {
      photo1x1: files.photo1x1?.[0]?.path,
      signature: files.signature?.[0]?.path,
      scholarDoc: files.scholarDoc?.[0]?.path,
      lossReasonDoc: files.lossReasonDoc?.[0]?.path
    },
    payment: {
      required: isPaidType,
      amount: data.type === 'rush' ? 150 : 100,
      status: isPaidType ? 'PENDING' : 'NOT_REQUIRED'
    }
  });

  return await request.save();
};

export const getByReference = async (refNo) => {
  const request = await IdRequest.findOne({ referenceNumber: refNo.toUpperCase() });
  if (!request) throw new Error('Request not found');
  return request;
};

export const getAllRequests = async (filters = {}) => {
  return await IdRequest.find(filters).sort({ createdAt: -1 });
};

export const getRequestById = async (id) => {
  return await IdRequest.findById(id);
};

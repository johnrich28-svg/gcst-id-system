import * as idGeneratorService from '../services/idGenerator.service.js';
import * as scheduleService from '../services/schedule.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { GeneratedId } from '../models/GeneratedId.model.js';
import path from 'path';
import fs from 'fs';

export const generateId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body; // provided by the sign-off modal
    const generatedId = await idGeneratorService.generateIdCard(id, staffId || null);
    res.status(200).json(new ApiResponse(200, generatedId, 'ID generated successfully'));
  } catch (error) {
    next(error);
  }
};

export const getGeneratedIds = async (req, res, next) => {
  try {
    const ids = await idGeneratorService.getGeneratedIds(req.query);
    res.status(200).json(new ApiResponse(200, ids));
  } catch (error) {
    next(error);
  }
};

export const updateReleaseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, scheduleData } = req.body; // 'schedule' or 'release'
    
    let result;
    if (action === 'schedule') {
      result = await scheduleService.setSchedule(id, scheduleData);
    } else {
      result = await scheduleService.releaseId(id);
    }
    
    res.status(200).json(new ApiResponse(200, result, `Status updated to ${action}`));
  } catch (error) {
    next(error);
  }
};

// ─── Re-generate PDFs for an existing GeneratedId record ─────────────────────
export const regeneratePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await idGeneratorService.regeneratePdf(id);
    res.status(200).json(new ApiResponse(200, record, 'PDFs regenerated successfully'));
  } catch (error) {
    next(error);
  }
};

// ─── Download a generated PDF ─────────────────────────────────────────────────
export const downloadPdf = async (req, res, next) => {
  try {
    const { id, side } = req.params; // side: 'front' | 'back'
    const record = await GeneratedId.findById(id);
    if (!record) return res.status(404).json(new ApiResponse(404, null, 'Generated ID not found'));

    const filePath = side === 'back' ? record.backPdfPath : record.frontPdfPath;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json(new ApiResponse(404, null, `PDF file not found on server`));
    }

    const safeName = path.basename(filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    next(error);
  }
};

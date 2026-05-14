import * as requestService from '../services/request.service.js';
import * as scheduleService from '../services/schedule.service.js';
import * as paymentService from '../services/payment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import archiver from 'archiver';

export const getRequests = async (req, res, next) => {
  try {
    const filters = req.query;
    const requests = await requestService.getAllRequests(filters);
    res.status(200).json(new ApiResponse(200, requests));
  } catch (error) {
    next(error);
  }
};

export const getRequestDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await requestService.getRequestById(id);
    if (!request) return res.status(404).json(new ApiResponse(404, null, 'Request not found'));
    res.status(200).json(new ApiResponse(200, request));
  } catch (error) {
    next(error);
  }
};

export const getBatches = async (req, res, next) => {
  try {
    const batches = await scheduleService.getBatches();
    res.status(200).json(new ApiResponse(200, batches));
  } catch (error) {
    next(error);
  }
};

export const runAutoBatch = async (req, res, next) => {
  try {
    const batches = await scheduleService.autoBatchGeneratedIds();
    res.status(200).json(new ApiResponse(200, batches, `${batches.length} batches created`));
  } catch (error) {
    next(error);
  }
};

export const updateBatchRelease = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { releaseDate } = req.body;
    const batch = await scheduleService.setBatchReleaseDate(id, releaseDate);
    res.status(200).json(new ApiResponse(200, batch));
  } catch (error) {
    next(error);
  }
};

export const releaseBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batch = await scheduleService.releaseBatch(id, req.user._id);
    res.status(200).json(new ApiResponse(200, batch));
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await paymentService.confirmCashierPayment(id);
    res.status(200).json(new ApiResponse(200, request, 'Payment confirmed successfully'));
  } catch (error) {
    next(error);
  }
};

export const downloadBatchZip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { batchName, files } = await scheduleService.getBatchPdfFiles(id);

    if (!files.length) {
      return res.status(404).json(new ApiResponse(404, null, 'No PDF files found for this batch'));
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${batchName}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    files.forEach(file => {
      archive.file(file.path, { name: file.name });
    });

    await archive.finalize();
  } catch (error) {
    next(error);
  }
};



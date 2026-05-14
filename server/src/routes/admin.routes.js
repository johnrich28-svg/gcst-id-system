import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/requests', adminController.getRequests);
router.get('/request/:id', adminController.getRequestDetails);
router.post('/request/:id/confirm-payment', adminController.confirmPayment);

// Schedule & Batching
router.get('/batches', adminController.getBatches);
router.post('/batches/auto', adminController.runAutoBatch);
router.put('/batches/:id/release-date', adminController.updateBatchRelease);
router.put('/batches/:id/release', adminController.releaseBatch);
router.get('/batches/:id/download', adminController.downloadBatchZip);


export default router;

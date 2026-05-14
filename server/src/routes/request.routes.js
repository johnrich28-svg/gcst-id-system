import express from 'express';
import * as requestController from '../controllers/request.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/', upload.fields([
  { name: 'photo1x1', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'scholarDoc', maxCount: 1 },
  { name: 'lossReasonDoc', maxCount: 1 }
]), requestController.createRequest);

router.get('/:ref', requestController.trackRequest);

export default router;

import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/initiate', paymentController.initiatePayment);
router.post('/webhook', paymentController.webhook);

export default router;

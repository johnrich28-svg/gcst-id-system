import express from 'express';
import authRoutes from './auth.routes.js';
import requestRoutes from './request.routes.js';
import adminRoutes from './admin.routes.js';
import validationRoutes from './validation.routes.js';
import paymentRoutes from './payment.routes.js';
import idRoutes from './id.routes.js';
import staffRoutes from './staff.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/request', requestRoutes);
router.use('/admin', adminRoutes);
router.use('/validation', validationRoutes);
router.use('/payment', paymentRoutes);
router.use('/id', idRoutes);
router.use('/staff', staffRoutes);

export default router;

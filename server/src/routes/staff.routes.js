import express from 'express';
import * as staffController from '../controllers/staff.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', staffController.getStaff);
router.post('/verify', staffController.verifyStaffPin);
router.post('/', staffController.createStaff);
router.delete('/:id', staffController.deactivateStaff);

export default router;

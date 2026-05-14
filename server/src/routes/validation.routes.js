import express from 'express';
import * as validationController from '../controllers/validation.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/:id', validationController.validateRequest);

export default router;

import express from 'express';
import * as idController from '../controllers/id.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/generated',              idController.getGeneratedIds);
router.post('/generate/:id',          idController.generateId);        // APPROVED or GENERATED → render PDFs
router.post('/regenerate/:id',        idController.regeneratePdf);     // Re-render PDFs for existing GeneratedId
router.put('/release/:id',            idController.updateReleaseStatus);
router.get('/download/:id/:side',     idController.downloadPdf);       // side: front | back

export default router;

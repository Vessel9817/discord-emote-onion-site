import express from 'express';
import { HomeController } from '../controllers/index.ts';
import { errorHandler } from '../middleware/index.ts';

const router = express.Router();

// Building home routes
router.get('/', HomeController.getHome, errorHandler);

export default router;

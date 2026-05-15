import express from 'express';
import { HomeController } from '../controllers/index';
import { errorHandler } from '../middleware/index';

const router = express.Router();

// Building home routes
router.get('/', HomeController.getHome, errorHandler);

export default router;

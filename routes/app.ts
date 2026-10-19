import express from 'express';
import { HomeController } from '../controllers';
import { errorHandler } from '../middleware';

const router = express.Router();

// Building home routes
router.get('/', HomeController.getHome, errorHandler);

export default router;

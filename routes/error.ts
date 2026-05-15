import express from 'express';
import { errorHandler } from '../middleware/index';

const router = express.Router();

router.use('/', errorHandler);

export default router;

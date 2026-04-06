import express from 'express';
import { errorHandler } from '../middleware/index.ts';

const router = express.Router();

router.use('/', errorHandler);

export default router;

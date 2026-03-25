import express from 'express';
import { errorHandler } from '../middleware';

const router = express.Router();

router.use('/', errorHandler);

export default router;

import express from 'express';
import { errorHandler, errorPage } from '../middleware/index.ts';

const router = express.Router();

router.use('/', errorPage, errorHandler);

export default router;

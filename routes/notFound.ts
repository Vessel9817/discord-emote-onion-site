import express from 'express';
import { errorHandler, errorPage } from '../middleware/index';

const router = express.Router();

router.use('/', errorPage, errorHandler);

export default router;

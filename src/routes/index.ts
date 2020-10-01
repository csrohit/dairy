import express from 'express';

import userRouter from './controllers/user.controller';
import dairyRouter from './controllers/dairy.controller';
import readingRouter from './controllers/reading.controller';
import transaction from './controllers/transaction.controller';
import logger from '../helpers/logger';
import User from '../models/user.model';

const router: express.Router = express.Router();

router.use('/user', userRouter);
router.use('/dairy', dairyRouter);
router.use('/reading', readingRouter);
router.use('/transaction', transaction);

export default router;
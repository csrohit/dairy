import express from 'express';
import Transaction from '../../models/transaction.model';
import logger from '../../helpers/logger';
import { INTERNAL_SERVER_ERROR, NOT_ACCEPTABLE } from 'http-status-codes';
import { Error } from 'mongoose';

const router = express.Router();



router.get('/:txnId', async (req, res) => {
	try {
		const txn = await Transaction.findById(req.params.txnId).exec();

		return res.json({ txn});
	}catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: `could not fetch transaction => ${req.params.txnId}`});
	}
});

router.get('/', async (req, res) => {
	try {
		const query = { };
		const txns = await Transaction.find(query).exec();

		return res.json({ txns});
	} catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not fetch transactions!'});
	}
});

router.post('/', async (req, res) => {
	try {
		let txn = new Transaction({
			amount: req.body.amount,
			farmer: req.body.farmer,
			dairy: req.body.dairy,
			startreading: req.body.startreading,
			endReading: req.body.endReading,
			lastTransaction: req.body.lastTransaction,
		});
		txn = await txn.save();

		return res.json({ txn});
	}catch (e) {
		if (e instanceof Error.ValidationError) {
			return res.status(NOT_ACCEPTABLE).json({ type: 'ValidationError', errors: e.errors});
		}
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not create transaction!'});
	}
});

export default router;
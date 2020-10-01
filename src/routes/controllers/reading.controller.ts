import express from 'express';
import Reading from '../../models/reading.model';
import logger from '../../helpers/logger';
import { INTERNAL_SERVER_ERROR, NOT_ACCEPTABLE } from 'http-status-codes';
import { Error } from 'mongoose';
import { Animal } from '../../models/dairy.model';
const router = express.Router();

router.get('/:reading', async (req, res) => {
	try {
		const query = { '_id': req.params.reading };
		const reading = await Reading.findOne(query).exec();

		// console.log(reading.amount);
		return res.json({ reading });
	} catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: `could not fetch reading => ${req.params.reading}` });
	}
});

router.get('/', async (req, res) => {
	try {
		const query = { };
		const readings = await Reading.find(query).exec();

		return res.json({ readings });
	} catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not fetch readings!' });
	}
});

router.post('/', async (req, res) => {
	try {
		console.log(req.body);
		let reading = new Reading({
			volume: new Map(req.body.volume),
			rate: new Map(req.body.rate),
			lactoReading: new Map(req.body.lactoReading),
			farmer: req.body.farmer,
			dairy: req.body.dairy,
		});
		console.log(reading.lactoReading.get(Animal.COW));
		reading = await reading.save();

		return res.json({ reading });
	} catch (e) {
		if (e instanceof Error.ValidationError) {
			return res.status(NOT_ACCEPTABLE).json({ type: 'ValidationError', errors: e.errors });
		}
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not create new reading!' });
	}
});



export default router;
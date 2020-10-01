import express, { Request, Response } from 'express';
import Dairy, { IDairy } from '../../models/dairy.model';
import logger from '../../helpers/logger';
import { INTERNAL_SERVER_ERROR, NOT_ACCEPTABLE, BAD_REQUEST, CONFLICT, NOT_FOUND, UNAUTHORIZED } from 'http-status-codes';
import { Error } from 'mongoose';
import { validationResult, body } from 'express-validator';
import { authenticateDairy } from '../../auth';
import { JwtSecret } from '../../config';
import { sign } from 'jsonwebtoken';
import User from '../../models/user.model';
import { UpdateWriteOpResult } from 'mongodb';

const router = express.Router();

// unprotected user

router.post('/login', [
	body('userName').notEmpty().trim().escape(),
	body('password').notEmpty().trim().escape()
], async (req: Request, res: Response) => {
	try {
		// if request is invalid then send errors with response
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(BAD_REQUEST).json({ errors: errors.array() });
		}

		// resond appropriately if user or password do not match
		const dairy = await Dairy.findOne({ 'userName': req.body.userName }).exec();
		if (!dairy) {
			return res.status(NOT_FOUND).json({ msg: `dairy userName:${req.body.userName} does not exist` });
		}
		if (await dairy.comparePassword(req.body.password)) {
			const token = sign(dairy.id, JwtSecret);

			return res.json({ token, dairy });
		}

		return res.status(UNAUTHORIZED).json({ msg: `invalid password for dairy userName: ${req.body.userName}` });
	} catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not something' });
	}
});

router.post('/', [
	body('title').notEmpty().isString().trim().escape(),
	body('manager').notEmpty().trim().escape().isMongoId(),
	body('userName').notEmpty().isString().trim().escape(),
	body('password').notEmpty().isString().trim().escape(),
	body('phone').notEmpty().isString().trim().escape(),
	body('email').notEmpty().isEmail().trim().escape(),
	body('coords').notEmpty(),
	body('rate').notEmpty(),
], async (req: Request, res: Response) => {
	try {
		// validate
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(BAD_REQUEST).json({ errors: errors.mapped() });
		}
		// check if dairy with given username already exists
		if (await Dairy.exists({ 'userName': req.body.userName })) {
			return res.status(CONFLICT).json({ msg: `dairy with userName: ${req.body.userName} already exists` });
		}
		let dairy = new Dairy({
			title: req.body.title,
			manager: req.body.manager,
			address: req.body.address,
			phone: req.body.phone,
			email: req.body.email,
			userName: req.body.userName,
			password: req.body.password,
			coords: req.body.coords,
			rate: req.body.rate,
		});
		dairy = await dairy.save();

		return res.json({ dairy });
	} catch (e) {
		if (e instanceof Error.ValidationError) {
			return res.status(NOT_ACCEPTABLE).json({ type: 'ValidationError', errors: e.errors });
		}
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not create new dairy!' });
	}
});

// protected route
router.use('/', authenticateDairy);

router.get('/', async (req, res) => {
	try {
		const query = { };
		const dairies = await Dairy.find(query).exec();

		return res.json({ dairies });
	} catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not fetch dairies!' });
	}
});

router.get('/request', async (req, res) => {
	try {
		// const dairyID = (req.user as IDairy)._id;
		// const dairy = await Dairy.findById(dairyID).select('requests').lean().exec();
		const dairy = req.user as IDairy;

		return res.json({ requests: dairy.requests });
	} catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not find dairy' });
	}
});

/** accept connection requests from farmers
 * we will update user.dairy
 * remove current request from dairy.requests
 * TODO: make stale requests auto destroy after specified time
 */
router.put('/request', [ body('userID').isMongoId() ], async (req: Request, res: Response) => {
	try {
		const dairyID = (req.user as IDairy)._id;

		/**
		 * Update the user
		 * n == 0 then document not found
		 * nModified == 0 then respond 'request already accepted'
		 * nModified == 1 the proceed
		 * TODO: check for OK field later
		 */
		let result: UpdateWriteOpResult['result'] =  await User.updateOne(
			{ _id: req.body.userID },
			{ $set: { dairy: dairyID } }
		).exec();
		if (!result.n) { return res.status(NOT_FOUND).json({ msg: `user ${req.body.userID} does not exist` }); }
		if (!result.nModified) { return res.status(CONFLICT).json({ msg: `req is already accepted` }); }
		if (result.nModified) {
			/**
			 * Update the dairy
			 * ! n == 0 then dairy is not found (also will not occur as dairy is currently logged in)
			 * ! nModified == 0 then request is not there or accepted already (will not occur  as we got the userID from dairy.requests)
			 * nModified ==1 successfully updated dairy
			 */
			result = await Dairy.updateOne({ _id: dairyID}, { $pull: { requests: req.body.userID }}).exec();
			if (!result.nModified) {
				// might want to reverting changes
				// await User.updateOne({ _id: req.body.userID}, { $unset: { dairy: '' }}).exec();

				return res.send({ msg: `request for user ${req.body.userID} does not exist` });
			}
		}
		// successfully set user.dairy and pulled userID from dairy.requests

		return res.json({ sucess: true });
	}catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not process request'});
	}
});

export default router;

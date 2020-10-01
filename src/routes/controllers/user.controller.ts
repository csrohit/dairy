import express, { Request, Response } from 'express';
import {
	INTERNAL_SERVER_ERROR, NOT_ACCEPTABLE, CONFLICT, NOT_FOUND, UNAUTHORIZED,
	BAD_REQUEST, OK
} from 'http-status-codes';
import { Error, Types } from 'mongoose';
import { body, validationResult } from 'express-validator';


import User, { Roles, IUser, MailPreferences } from '../../models/user.model';
import logger from '../../helpers/logger';
import { sign } from 'jsonwebtoken';
import { JwtSecret } from '../../config';
import { authenticateUser } from '../../auth';
import Dairy from '../../models/dairy.model';
import { UpdateWriteOpResult } from 'mongodb';
const router: express.Router = express.Router();

// routes where authentication is not required
router.post('/login', [
	body('userName').notEmpty().trim().escape(),
	body('password').notEmpty().trim().escape()
], async (req: Request, res: Response) => {
	try {
		// if request is invalid then send errors with response
		const errors = validationResult(req);
		if (!errors.isEmpty()) { return res.status(BAD_REQUEST).json({ errors: errors.array() }); }

		// resond appropriately if user or password do not match
		const user = await User.findOne({ 'userName': req.body.userName }).exec();
		if (!user) { return res.status(NOT_FOUND).json({ msg: `user userName:${req.body.userName} does not exist` }); }
		if (await user.comparePassword(req.body.password)) {
			const token = sign({ _id: user.id }, JwtSecret);
			console.log(token);
			return res.json({ token, user });
		}

		return res.status(UNAUTHORIZED).json({ msg: `invalid password for user userName: ${req.body.userName}` });
	} catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not something' });
	}
});

// TODO: remove dairy parameter in future
router.post('/', [
	body('userName').notEmpty().isString().trim().escape(),
	body('password').notEmpty().isString().trim().escape(),
	body('name').notEmpty().isString().trim().escape(),
	body('email').notEmpty().isEmail().trim().escape(),
	body('age').notEmpty().isInt().trim().escape(),
	body('phone').notEmpty().isInt().trim().escape(),
	body('address').notEmpty(),
], async (req: Request, res: Response) => {
	try {
		// validate
		const errors = validationResult(req);
		if (!errors.isEmpty()) { return res.status(BAD_REQUEST).json({ errors: errors.mapped() }); }
		// check if user with given username already exists
		if (await User.exists({ 'userName': req.body.userName })) {
			return res.status(CONFLICT).json({ msg: `user with userName: ${req.body.userName} already exists` });
		}
		let user = new User({
			name: req.body.name,
			userName: req.body.userName,
			email: req.body.email,
			password: req.body.password,
			age: req.body.age,
			phone: req.body.phone,
			address: req.body.address,
			location: req.body.location,
			mailPreference: req.body.mailPreference
		});
		user = (await user.save()).toObject();

		return res.json({ user });
	} catch (e) {
		if (e instanceof Error.ValidationError) {
			return res.status(NOT_ACCEPTABLE).json({ type: 'ValidationError', errors: e.errors });
		}
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'couldnot create new User' });
	}
});

router.get('/mail-preference', async (req, res) => {
	return res.json(MailPreferences);
});

// routes with authentication
router.use('/', authenticateUser);

router.get('/', async (req, res) => {
	try {
		const query = {}; // construct mongoose query from request query
		const users = await User.find(query).exec();

		return res.json({ users });
	} catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not fetch users!' });
	}
});

// send join rquest to dairy
router.put('/request', [
	body('dairyID').isMongoId()
], async (req: Request, res: Response) => {
	try {
		// validate request for dairyID
		const errors = validationResult(req);
		if (!errors.isEmpty()) { return res.status(BAD_REQUEST).json({ errors: errors.mapped() }); }

		/**
		 * check if user is already enroled in a dairy, proceed only if not
		 *
		 *
		 * Assume that the dairy already exists
		 * directly push new request
		 * if n == 0 then dairy does not exist and respond 404
		 * if nModified = 0 then request already sent
		 * if nModified = 1 then request is sent successfully
		 */
		// const user
		if ((req.user as IUser).dairy) { return res.status(CONFLICT).json({ msg: 'Already registered to dairy' }); }

		const userID = (req.user as IUser)._id;
		const result: UpdateWriteOpResult['result'] = (await Dairy.updateOne(
			{ _id: req.body.dairyID },
			{ $addToSet: { 'requests': userID } }
		).exec());

		if (!result.n) { return res.status(NOT_FOUND).json({ msg: `dairy ${req.body.dairyID} doesn not exist` }); }
		if (!result.nModified) { return res.status(CONFLICT).json({ msg: 'Request already sent' }); }

		return res.json({ result });
	} catch (e) {
		logger.error(e);

		return res.status(INTERNAL_SERVER_ERROR).json({ msg: 'could not send request' });
	}
});

export default router;

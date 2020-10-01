import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtSecret } from './config';
import Dairy, { IDairy } from './models/dairy.model';
import User, { IUser } from './models/user.model';

passport.use('dairy', new Strategy({
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: JwtSecret
}, (jwtPayload, done) => {
	Dairy.findById(jwtPayload._id).lean().exec()
		.then((dairy: IDairy) => done(null, dairy ? dairy : false))
		.catch((e: Error) => done(e));
}));


passport.use('user', new Strategy({
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: JwtSecret
},
	(jwtPayload, done) => {
		User.findById(jwtPayload._id).lean().exec()
			.then((user: IUser) => done(null, user ? user : false))
			.catch((e: Error) => done(e));
	}));

export const authenticateDairy = passport.authenticate('dairy', { session: false });
export const authenticateUser = passport.authenticate('user', { session: false });
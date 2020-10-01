import { Document, Schema, Model, model, Types } from 'mongoose';
import { genSalt, hash, compare } from 'bcryptjs';
import logger from '../helpers/logger';
import { MilkDetail } from './reading.model';
import { IUser } from './user.model';

//  address
export interface IAddress extends Document {
	pincode: number;
	line1: string;
	line2: string;
	villTown: string;
	taluka: string;
	district: string;
	state: string;
	country: string;
}

export const addressSchema = new Schema<IAddress>({
	pincode: { type: Number, min: [100000, 'Invalid Pincode'], max: [999999, 'Ivalid Pincode'] },
	line1: { type: String },
	line2: { type: String },
	villTown: { type: String },
	taluka: { type: String },
	district: { type: String },
	state: { type: String, default: 'Maharashtra' },
	country: { type: String, default: 'India' }
}, { _id: false });

// location
export interface ILocation extends Document {
	x: string;
	y: number;
}

export const locationSchema = new Schema<ILocation>({
	x: { type: Number },
	y: { type: Number }
}, { _id: false });

// Animal
export enum Animal {
	COW = 'cow',
	BUFFALO = 'buffalo',
	GOAT = 'goat',
	SHEEP = 'sheep'
}

// dairy
export interface IDairy extends Document {
	title: string;
	manager: IUser['_id'];
	address: IAddress;
	phone: string;
	email: string;
	userName: string;
	password: string;
	location: ILocation;
	rate: MilkDetail;
	createdAt: Date;
	openFrom: string;
	openTill: string;
	members?: IUser[];
	requests?: IUser['_id'][];

	comparePassword?(password: IDairy['password']): Promise<boolean>;
}

const dairySchema = new Schema<IDairy>({
	title: { type: String, required: true },
	manager: { type: Schema.Types.ObjectId, ref: 'User' },
	address: addressSchema,
	phone: { type: String },
	email: { type: String },
	userName: { type: String, required: true },
	password: { type: String },
	location: { type: locationSchema },
	rate: { type: Map, of: Number, required: true },   // rate will be updated frequently a per the price of milk
	createdAt: { type: Date, default: Date.now() },
	openFrom: { type: String, default: '0730' },
	openTill: { type: String, default: '0930' },
	requests: [{ type: Types.ObjectId, ref: 'User' }]
}, {
	toObject: {
		transform(doc: IDairy, ret: IDairy) {
			delete ret.password;
		}
	},
	toJSON: {
		transform(doc: IDairy, ret: IDairy) {
			delete ret.password;
		}
	}
});

// virtuals
dairySchema.virtual('members', {
	ref: 'User',
	localField: '_id',
	foreignField: 'dairy'
});


dairySchema.method('comparePassword', async function (this: IDairy, password: IUser['password']) {
	return compare(password, this.password);
});

dairySchema.pre<IDairy>('save', async function (next) {
	const salt = await genSalt(10);
	this.password = await hash(this.password, salt);
	next();
});


const Dairy: Model<IDairy> = model<IDairy>('Dairy', dairySchema);
export default Dairy;















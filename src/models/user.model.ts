import { Document, Schema, Model, model, Types } from 'mongoose';
import bcrypt, { genSalt, hash, compare } from 'bcryptjs';
import logger from '../helpers/logger';
import { IAddress, ILocation, addressSchema, locationSchema } from './dairy.model';

// ! Schema has only  model definition but model has methods as well

export enum Role{
  Farmer = 0,
  Manager = 1
}
export const Roles: Role[] = [Role.Farmer, Role.Manager];

export enum MailPreference{
  PAYMENT = 'payment',
  DELIVERY = 'delivery',
  UPDATES = 'updates'
}
export const MailPreferences: MailPreference[] = [MailPreference.PAYMENT, MailPreference.DELIVERY, MailPreference.UPDATES];

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  userName: string;
  password: string;
  phone: string;
  age: number;
  dairy: string;
  createdAt: Date;
  role: Role;
  address: IAddress;
  location: ILocation;
  mailPreference: Map<MailPreference, boolean>;

  comparePassword?(password: IUser['password']): Promise<boolean>;
}


// string => type and String => value
// here type field needs a value
const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, requiredPaths: true },
  age: { type: Number },
  dairy: { type: Types.ObjectId },
  createdAt: { type: Date, default: Date.now() },
  role: { type: Number, enum: Roles},
  address: addressSchema,
  location: locationSchema,
  mailPreference: { type: Map, of: String }
}, {
  toObject: {
	transform (doc: IUser, ret: IUser) {
		delete ret.password;
	}
  },
  toJSON: {
	transform (doc: IUser, ret: IUser) {
		delete ret.password;
	}
  }
});


userSchema.pre<IUser>('save', async function(next) {
  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);
  logger.info(this.password);
  next();
});

userSchema.method('comparePassword', async function(this: IUser, password: IUser['password']) {
  return compare(password, this.password);
});

// returns a document of type `IUser`
const User: Model<IUser> = model<IUser>('User', userSchema);
export default User;


/*
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
});


private getUserById = async (request: Request, response: Response, next: NextFunction) => {
  const id = request.params.id;
  const user = await this.user.findById(id).populate('posts');
  if (user) {
    response.send(user);
  } else {
    next(new UserNotFoundException(id));
  }
}



// Static methods
UserSchema.statics.findWithCompany = async function(id) {
  return this.findById(id).populate("company").exec()
}

// For model
export interface IUserModel extends Model<IUser> {
  findMyCompany(id: string): Promise<IUser_populated>
}



// Virtuals
UserSchema.virtual("fullName").get(function() {
  return this.firstName + this.lastName
})

// Methods
UserSchema.methods.getGender = function() {
  return this.gender > 0 ? "Male" : "Female"
}

// DO NOT export
interface IUserBase extends IUserSchema {
  fullName: string;
  getGender(): string;
}



*/
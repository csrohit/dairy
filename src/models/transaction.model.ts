import { Document, Schema, Model, model } from "mongoose";
import { IUser } from "./user.model";
import { IDairy } from "./dairy.model";
import { IReading } from "./reading.model";

export interface ITransaction extends Document{
	amount: number;
	farmer: IUser['_id'];
	dairy: IDairy['_id'];
	startReading: IReading['_id'];
	endReading: IReading['_id'];
	createdAt: Date;
	lastTransaction: ITransaction['_id'];
}

const transactionSchema = new Schema<ITransaction>({
	amount: { type: Number , required: true},
	farmer: { type: Schema.Types.ObjectId, ref: 'User'},
	dairy: { type: Schema.Types.ObjectId, ref: 'Dairy'},
	startReading: { type: Schema.Types.ObjectId, ref: 'Reading'},
	endReading: { type: Schema.Types.ObjectId, ref: 'Reading'},
	createdAt: { type: Date, default: Date.now()},
	lastTransaction: { type: Schema.Types.ObjectId, ref: 'Transaction'},
});

const Transaction: Model<ITransaction> = model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
import { Schema, Document, Model, model } from 'mongoose';
import { Animal, IDairy } from './dairy.model';
import { IUser } from './user.model';

/**
 * To store maps in mongoose keys must be strings
 * volume = [['cow', 1000],[Animal.BUFFALO, 2000]];
 */
export type MilkDetail = Map<Animal, number>;
export interface IReading extends Document {
	volume: MilkDetail;
	lactoReading: MilkDetail;
	dairy: IDairy['_id'];
	farmer: IUser['_id'];
	rate: MilkDetail;
	collectedAt: Date;
	amount: number;
}

// a single devery may contain milk of different types
const readingSchema = new Schema<IReading>({
	volume: { type: Map, of: Number, required: true },
	lactoReading: { type: Map, of: Number, required: true },
	dairy: { type: Schema.Types.ObjectId, ref: 'Dairy' },
	farmer: { type: Schema.Types.ObjectId, ref: 'User' },
	rate: { type: Map, of: Number, required: true },
	collectedAt: { type: Date, default: Date.now(), alias: 'deliveredAt' }
});


// virtuals
readingSchema.virtual('amount').get(function (this: IReading) {
	let amount: number = 0;
	this.volume.forEach((vol, milkType, ) => {
		amount += vol * this.rate.get(milkType);
	});

	return amount;
});
const Reading: Model<IReading> = model<IReading>('Reading', readingSchema);
export default Reading;
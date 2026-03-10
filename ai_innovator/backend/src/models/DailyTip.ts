import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyTip extends Document {
  tip_text: string;
  tip_text_hi?: string;
  tip_text_mr?: string;
  source?: string;
  tip_date: Date;
  is_active: boolean;
}

const dailyTipSchema = new Schema<IDailyTip>(
  {
    tip_text: { type: String, required: true },
    tip_text_hi: { type: String },
    tip_text_mr: { type: String },
    source: { type: String },
    tip_date: { type: Date, required: true, unique: true },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDailyTip>('DailyTip', dailyTipSchema);

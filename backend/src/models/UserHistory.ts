import mongoose, { Document, Schema } from 'mongoose';

export interface IUserHistory extends Document {
  user_id: mongoose.Types.ObjectId;
  type: 'symptom_check' | 'image_check';
  input_data: any;
  result: any;
  disease_name?: string;
  confidence?: number;
  severity?: 'mild' | 'moderate' | 'severe';
  urgency?: 'low' | 'medium' | 'high';
  deleted_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userHistorySchema = new Schema<IUserHistory>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['symptom_check', 'image_check'],
      required: true,
    },
    input_data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    result: {
      type: Schema.Types.Mixed,
      default: {},
    },
    disease_name: {
      type: String,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userHistorySchema.index({ user_id: 1, createdAt: -1 });

export default mongoose.model<IUserHistory>('UserHistory', userHistorySchema);

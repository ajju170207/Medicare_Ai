import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user_id: mongoose.Types.ObjectId;
  type: 'health_tip' | 'system' | 'reminder' | 'alert' | 'new_feature';
  title: string;
  body: string;
  action_url?: string;
  metadata?: any;
  read: boolean;
  read_at?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['health_tip', 'system', 'reminder', 'alert', 'new_feature'], default: 'system' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    action_url: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false },
    read_at: { type: Date },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user_id: 1, read: 1 });
notificationSchema.index({ user_id: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);

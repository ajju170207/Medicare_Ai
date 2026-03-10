import mongoose, { Document, Schema } from 'mongoose';

export interface IDisease extends Document {
  name: string;
  slug: string;
  description: string;
  symptoms: string[];
  severity_score?: number;
  severity: 'mild' | 'moderate' | 'severe';
  precautions: string[];
  medications: string[];
  diet_recommendations: string[];
  workout_recommendations: string[];
  specialist_type: string;
  icd_code?: string;
  body_system?: string;
  is_active: boolean;
}

const diseaseSchema = new Schema<IDisease>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    symptoms: [{ type: String }],
    severity_score: { type: Number },
    severity: { type: String, enum: ['mild', 'moderate', 'severe'], required: true },
    precautions: [{ type: String }],
    medications: [{ type: String }],
    diet_recommendations: [{ type: String }],
    workout_recommendations: [{ type: String }],
    specialist_type: { type: String, required: true },
    icd_code: { type: String },
    body_system: { type: String },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient text search
diseaseSchema.index({ name: 'text', description: 'text', symptoms: 'text' });
diseaseSchema.index({ slug: 1 });
diseaseSchema.index({ is_active: 1 });

export default mongoose.model<IDisease>('Disease', diseaseSchema);

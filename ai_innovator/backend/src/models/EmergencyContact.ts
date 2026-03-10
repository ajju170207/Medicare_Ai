import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyContact extends Document {
  name: string;
  phone: string;
  type: 'hospital' | 'ambulance' | 'helpline' | 'clinic' | 'blood_bank';
  hospital_type?: 'government' | 'private' | 'clinic' | 'diagnostic' | 'trust';
  state: string;
  district?: string;
  city?: string;
  address?: string;
  pincode?: string;
  location?: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  available_24h: boolean;
  is_active: boolean;
  data_source?: string;
}

const emergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    type: { type: String, enum: ['hospital', 'ambulance', 'helpline', 'clinic', 'blood_bank'], required: true },
    hospital_type: { type: String, enum: ['government', 'private', 'clinic', 'diagnostic', 'trust'] },
    state: { type: String, required: true },
    district: { type: String },
    city: { type: String },
    address: { type: String },
    pincode: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // Note: MongoDB requires longitude first, then latitude
      },
    },
    available_24h: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    data_source: { type: String },
  },
  {
    timestamps: true,
  }
);

// 2dsphere index for geospatial queries
emergencyContactSchema.index({ location: '2dsphere' });
emergencyContactSchema.index({ state: 1 });
emergencyContactSchema.index({ type: 1 });

export default mongoose.model<IEmergencyContact>('EmergencyContact', emergencyContactSchema);

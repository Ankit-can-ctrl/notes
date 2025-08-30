import { Schema, model, Document } from "mongoose";

export interface IOtp extends Document {
  _id: string;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster email lookups
otpSchema.index({ email: 1 });

export const Otp = model<IOtp>("Otp", otpSchema);

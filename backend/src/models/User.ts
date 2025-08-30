import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  _id: string;
  email: string;
  name: string;
  dateOfBirth?: string;
  provider: "otp" | "google";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      required: false,
    },
    provider: {
      type: String,
      enum: ["otp", "google"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster email lookups
userSchema.index({ email: 1 });

export const User = model<IUser>("User", userSchema);

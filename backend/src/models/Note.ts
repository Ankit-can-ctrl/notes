import { Schema, model, Document, Types } from "mongoose";

export interface INote extends Document {
  _id: string;
  userId: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster user-based queries
noteSchema.index({ userId: 1 });

export const Note = model<INote>("Note", noteSchema);

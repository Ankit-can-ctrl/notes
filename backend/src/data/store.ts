import { User, IUser } from "../models/User";
import { Note, INote } from "../models/Note";
import { Otp, IOtp } from "../models/Otp";
import { Types } from "mongoose";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string;
  provider: "otp" | "google";
}

export interface NoteRecord {
  id: string;
  userId: string;
  title: string;
}

export interface OtpRecord {
  email: string;
  code: string;
  expiresAt: number;
}

// Helper function to convert MongoDB user to UserRecord
const toUserRecord = (user: IUser): UserRecord => ({
  id: user._id.toString(),
  email: user.email,
  name: user.name,
  dateOfBirth: user.dateOfBirth,
  provider: user.provider,
});

// Helper function to convert MongoDB note to NoteRecord
const toNoteRecord = (note: INote): NoteRecord => ({
  id: note._id.toString(),
  userId: note.userId.toString(),
  title: note.title,
});

export const store = {
  async upsertUserByEmail(
    email: string,
    name: string,
    dateOfBirth: string | undefined,
    provider: "otp" | "google"
  ): Promise<UserRecord> {
    try {
      // Check if user already exists
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return toUserRecord(existing);
      }

      // Create new user
      const user = await User.create({
        email: email.toLowerCase(),
        name,
        dateOfBirth,
        provider,
      });

      return toUserRecord(user);
    } catch (error) {
      console.error("Error upserting user:", error);
      throw error;
    }
  },

  async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user ? toUserRecord(user) : undefined;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw error;
    }
  },

  async getUserById(id: string): Promise<UserRecord | undefined> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return undefined;
      }
      const user = await User.findById(id);
      return user ? toUserRecord(user) : undefined;
    } catch (error) {
      console.error("Error getting user by id:", error);
      throw error;
    }
  },

  async listNotes(userId: string): Promise<NoteRecord[]> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        return [];
      }
      const notes = await Note.find({
        userId: new Types.ObjectId(userId),
      }).sort({ createdAt: -1 });
      return notes.map(toNoteRecord);
    } catch (error) {
      console.error("Error listing notes:", error);
      throw error;
    }
  },

  async createNote(userId: string, title: string): Promise<NoteRecord> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
      }

      const note = await Note.create({
        userId: new Types.ObjectId(userId),
        title,
      });

      return toNoteRecord(note);
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  },

  async deleteNote(userId: string, noteId: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(noteId)) {
        return false;
      }

      const result = await Note.deleteOne({
        _id: new Types.ObjectId(noteId),
        userId: new Types.ObjectId(userId),
      });

      return result.deletedCount === 1;
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },

  async setOtp(email: string, code: string, ttlMs: number): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlMs);

      // Remove any existing OTP for this email
      await Otp.deleteMany({ email: email.toLowerCase() });

      // Create new OTP
      await Otp.create({
        email: email.toLowerCase(),
        code,
        expiresAt,
      });
    } catch (error) {
      console.error("Error setting OTP:", error);
      throw error;
    }
  },

  async verifyOtp(email: string, code: string): Promise<boolean> {
    try {
      const otpRecord = await Otp.findOne({
        email: email.toLowerCase(),
        code,
        expiresAt: { $gt: new Date() },
      });

      if (otpRecord) {
        // Delete the OTP after successful verification
        await Otp.deleteOne({ _id: otpRecord._id });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const User_1 = require("../models/User");
const Note_1 = require("../models/Note");
const Otp_1 = require("../models/Otp");
const mongoose_1 = require("mongoose");
// Helper function to convert MongoDB user to UserRecord
const toUserRecord = (user) => ({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    dateOfBirth: user.dateOfBirth,
    provider: user.provider,
});
// Helper function to convert MongoDB note to NoteRecord
const toNoteRecord = (note) => ({
    id: note._id.toString(),
    userId: note.userId.toString(),
    title: note.title,
});
exports.store = {
    async upsertUserByEmail(email, name, dateOfBirth, provider) {
        try {
            // Check if user already exists
            const existing = await User_1.User.findOne({ email: email.toLowerCase() });
            if (existing) {
                return toUserRecord(existing);
            }
            // Create new user
            const user = await User_1.User.create({
                email: email.toLowerCase(),
                name,
                dateOfBirth,
                provider,
            });
            return toUserRecord(user);
        }
        catch (error) {
            console.error("Error upserting user:", error);
            throw error;
        }
    },
    async getUserByEmail(email) {
        try {
            const user = await User_1.User.findOne({ email: email.toLowerCase() });
            return user ? toUserRecord(user) : undefined;
        }
        catch (error) {
            console.error("Error getting user by email:", error);
            throw error;
        }
    },
    async getUserById(id) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return undefined;
            }
            const user = await User_1.User.findById(id);
            return user ? toUserRecord(user) : undefined;
        }
        catch (error) {
            console.error("Error getting user by id:", error);
            throw error;
        }
    },
    async listNotes(userId) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                return [];
            }
            const notes = await Note_1.Note.find({
                userId: new mongoose_1.Types.ObjectId(userId),
            }).sort({ createdAt: -1 });
            return notes.map(toNoteRecord);
        }
        catch (error) {
            console.error("Error listing notes:", error);
            throw error;
        }
    },
    async createNote(userId, title) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                throw new Error("Invalid user ID");
            }
            const note = await Note_1.Note.create({
                userId: new mongoose_1.Types.ObjectId(userId),
                title,
            });
            return toNoteRecord(note);
        }
        catch (error) {
            console.error("Error creating note:", error);
            throw error;
        }
    },
    async deleteNote(userId, noteId) {
        try {
            if (!mongoose_1.Types.ObjectId.isValid(userId) || !mongoose_1.Types.ObjectId.isValid(noteId)) {
                return false;
            }
            const result = await Note_1.Note.deleteOne({
                _id: new mongoose_1.Types.ObjectId(noteId),
                userId: new mongoose_1.Types.ObjectId(userId),
            });
            return result.deletedCount === 1;
        }
        catch (error) {
            console.error("Error deleting note:", error);
            throw error;
        }
    },
    async setOtp(email, code, ttlMs) {
        try {
            const expiresAt = new Date(Date.now() + ttlMs);
            // Remove any existing OTP for this email
            await Otp_1.Otp.deleteMany({ email: email.toLowerCase() });
            // Create new OTP
            await Otp_1.Otp.create({
                email: email.toLowerCase(),
                code,
                expiresAt,
            });
        }
        catch (error) {
            console.error("Error setting OTP:", error);
            throw error;
        }
    },
    async verifyOtp(email, code) {
        try {
            const otpRecord = await Otp_1.Otp.findOne({
                email: email.toLowerCase(),
                code,
                expiresAt: { $gt: new Date() },
            });
            if (otpRecord) {
                // Delete the OTP after successful verification
                await Otp_1.Otp.deleteOne({ _id: otpRecord._id });
                return true;
            }
            return false;
        }
        catch (error) {
            console.error("Error verifying OTP:", error);
            throw error;
        }
    },
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
// Create index for faster email lookups
userSchema.index({ email: 1 });
exports.User = (0, mongoose_1.model)("User", userSchema);

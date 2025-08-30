"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Otp = void 0;
const mongoose_1 = require("mongoose");
const otpSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
});
// Create index for faster email lookups
otpSchema.index({ email: 1 });
exports.Otp = (0, mongoose_1.model)("Otp", otpSchema);

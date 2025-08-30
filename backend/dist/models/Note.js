"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const mongoose_1 = require("mongoose");
const noteSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});
// Create index for faster user-based queries
noteSchema.index({ userId: 1 });
exports.Note = (0, mongoose_1.model)("Note", noteSchema);

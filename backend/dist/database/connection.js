"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = connectToDatabase;
exports.disconnectFromDatabase = disconnectFromDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
async function connectToDatabase() {
    try {
        const mongoUrl = process.env.MONGO_URL;
        if (!mongoUrl) {
            throw new Error("MONGO_URL environment variable is not defined");
        }
        await mongoose_1.default.connect(mongoUrl);
        console.log("✅ Connected to MongoDB successfully");
    }
    catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error);
        throw error;
    }
}
async function disconnectFromDatabase() {
    try {
        await mongoose_1.default.disconnect();
        console.log("✅ Disconnected from MongoDB successfully");
    }
    catch (error) {
        console.error("❌ Failed to disconnect from MongoDB:", error);
        throw error;
    }
}
// Handle connection events
mongoose_1.default.connection.on("connected", () => {
    console.log("🔗 Mongoose connected to MongoDB");
});
mongoose_1.default.connection.on("error", (error) => {
    console.error("❌ Mongoose connection error:", error);
});
mongoose_1.default.connection.on("disconnected", () => {
    console.log("🔌 Mongoose disconnected from MongoDB");
});

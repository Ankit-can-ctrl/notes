import mongoose from "mongoose";

export async function connectToDatabase(): Promise<void> {
  try {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
      throw new Error("MONGO_URL environment variable is not defined");
    }

    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB successfully");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB successfully");
  } catch (error) {
    console.error("❌ Failed to disconnect from MongoDB:", error);
    throw error;
  }
}

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("🔗 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ Mongoose connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("🔌 Mongoose disconnected from MongoDB");
});

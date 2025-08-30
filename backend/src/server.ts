import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import dotenv from "dotenv";
import passport from "passport";
import { authRouter } from "./routes/authRoutes";
import { notesRouter } from "./routes/notesRoutes";
import { errorHandler } from "./utils/errorHandler";
import { connectToDatabase } from "./database/connection";

dotenv.config();

// Import strategies after dotenv.config() to ensure environment variables are loaded
import "./strategies/google";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);

app.use(errorHandler);

const port = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    // Connect to MongoDB first
    await connectToDatabase();

    // Start the server
    app.listen(port, () => {
      console.log(`✅ Backend listening on http://localhost:${port}`);
      console.log(`🔗 MongoDB connection established`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

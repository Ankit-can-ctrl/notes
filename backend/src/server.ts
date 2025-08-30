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

// CORS configuration for production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173", // Development
  "http://localhost:3000", // Development
  "https://notes1-topaz.vercel.app",
];

// Remove undefined values
const origins = allowedOrigins.filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (origins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
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
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
      console.log(`🌐 CORS origins: ${origins.join(", ")}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

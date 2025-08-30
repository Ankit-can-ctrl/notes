"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_1 = __importDefault(require("passport"));
const authRoutes_1 = require("./routes/authRoutes");
const notesRoutes_1 = require("./routes/notesRoutes");
const errorHandler_1 = require("./utils/errorHandler");
const connection_1 = require("./database/connection");
dotenv_1.default.config();
// Import strategies after dotenv.config() to ensure environment variables are loaded
require("./strategies/google");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24,
    },
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.use("/api/auth", authRoutes_1.authRouter);
app.use("/api/notes", notesRoutes_1.notesRouter);
app.use(errorHandler_1.errorHandler);
const port = Number(process.env.PORT || 3000);
async function startServer() {
    try {
        // Connect to MongoDB first
        await (0, connection_1.connectToDatabase)();
        // Start the server
        app.listen(port, () => {
            console.log(`✅ Backend listening on http://localhost:${port}`);
            console.log(`🔗 MongoDB connection established`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}
startServer();

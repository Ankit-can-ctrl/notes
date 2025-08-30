"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const passport_1 = __importDefault(require("passport"));
require("../strategies/google");
const store_1 = require("../data/store");
const jwt_1 = require("../utils/jwt");
const requireAuth_1 = require("../middleware/requireAuth");
exports.authRouter = (0, express_1.Router)();
const requestOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
exports.authRouter.post("/request-otp", (req, res) => {
    const parsed = requestOtpSchema.safeParse(req.body);
    if (!parsed.success)
        throw parsed.error;
    const { email } = parsed.data;
    // Generate a 6-digit OTP. In real system, send via email provider.
    const code = String(Math.floor(100000 + Math.random() * 900000));
    store_1.store.setOtp(email, code, 5 * 60 * 1000);
    // For demo/dev, return masked message and include code if explicitly allowed
    const includeCode = process.env.RETURN_OTP_IN_RESPONSE === "true";
    res.json({
        ok: true,
        message: "OTP sent to email",
        code: includeCode ? code : undefined,
    });
});
const verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().min(2).max(100),
    dateOfBirth: zod_1.z.string().optional(), // yyyy-mm-dd
    code: zod_1.z.string().regex(/^\d{6}$/),
});
exports.authRouter.post("/verify-otp", (req, res) => {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success)
        throw parsed.error;
    const { email, name, dateOfBirth, code } = parsed.data;
    const ok = store_1.store.verifyOtp(email, code);
    if (!ok)
        return res.status(401).json({ error: "InvalidOrExpiredOtp" });
    const user = store_1.store.upsertUserByEmail(email, name, dateOfBirth, "otp");
    const token = (0, jwt_1.signJwt)({ id: user.id, email: user.email, name: user.name });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});
// Google OAuth
exports.authRouter.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"], session: true }));
exports.authRouter.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/api/auth/google/failure", session: true }), (req, res) => {
    const user = req.user;
    const token = (0, jwt_1.signJwt)({ id: user.id, email: user.email, name: user.name });
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontend}/oauth-callback#token=${encodeURIComponent(token)}`);
});
exports.authRouter.get("/google/failure", (_req, res) => {
    res.status(401).json({ error: "GoogleAuthFailed" });
});
exports.authRouter.get("/me", requireAuth_1.requireAuth, (req, res) => {
    const user = req.user;
    res.json({ user });
});

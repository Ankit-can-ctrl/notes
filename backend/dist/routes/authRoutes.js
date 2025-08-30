"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const requireAuth_1 = require("../middleware/requireAuth");
exports.authRouter = (0, express_1.Router)();
// OTP Authentication routes
exports.authRouter.post("/request-otp", authController_1.authController.requestOtp);
exports.authRouter.post("/verify-otp", authController_1.authController.verifyOtp);
exports.authRouter.post("/signin-otp", authController_1.authController.signinOtp);
// Google OAuth routes
exports.authRouter.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: true,
}));
exports.authRouter.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
    session: true,
}), authController_1.authController.googleCallback);
exports.authRouter.get("/google/failure", authController_1.authController.googleFailure);
// Protected routes
exports.authRouter.get("/me", requireAuth_1.requireAuth, authController_1.authController.getMe);

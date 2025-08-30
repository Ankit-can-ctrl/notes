import { Router } from "express";
import passport from "passport";
import { authController } from "../controllers/authController";
import { requireAuth } from "../middleware/requireAuth";

export const authRouter = Router();

// OTP Authentication routes
authRouter.post("/request-otp", authController.requestOtp);
authRouter.post("/verify-otp", authController.verifyOtp);
authRouter.post("/signin-otp", authController.signinOtp);

// Google OAuth routes
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: true,
  })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
    session: true,
  }),
  authController.googleCallback
);

authRouter.get("/google/failure", authController.googleFailure);

// Protected routes
authRouter.get("/me", requireAuth as any, authController.getMe as any);

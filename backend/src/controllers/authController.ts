import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import passport from "passport";
import { store } from "../data/store";
import { signJwt } from "../utils/jwt";
import { AuthedRequest } from "../middleware/requireAuth";
import { EmailService } from "../services/emailService";

const requestOtpSchema = z.object({
  email: z.string().email(),
  mode: z.enum(["signup", "signin"]).optional().default("signup"),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  dateOfBirth: z.string().optional(), // yyyy-mm-dd
  code: z.string().regex(/^\d{6}$/),
});

const signinOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
});

export const authController = {
  requestOtp: async (req: Request, res: Response) => {
    const parsed = requestOtpSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;
    const { email, mode } = parsed.data;

    // Check if email already exists
    const existingUser = await store.getUserByEmail(email);

    if (mode === "signin") {
      // For signin mode, check if user exists
      if (!existingUser) {
        return res.status(404).json({
          error: "User not found. Please sign up first.",
          emailExists: false,
        });
      }

      // Generate OTP for existing user signin
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await store.setOtp(email, code, 5 * 60 * 1000);

      // Send OTP via email
      const emailSent = await EmailService.sendOTP({
        email,
        otp: code,
        name: existingUser.name,
        isSignIn: true,
      });

      const includeCode = process.env.RETURN_OTP_IN_RESPONSE === "true";

      return res.json({
        ok: true,
        emailExists: true,
        message: emailSent
          ? "OTP sent to email for signin"
          : "OTP generated (email service unavailable)",
        user: { email: existingUser.email, name: existingUser.name },
        code: includeCode ? code : undefined,
        emailServiceWorking: emailSent,
      });
    } else {
      // For signup mode, check if email already exists
      if (existingUser) {
        // Generate OTP for existing user (for signin flow)
        const code = String(Math.floor(100000 + Math.random() * 900000));
        await store.setOtp(email, code, 5 * 60 * 1000);

        // Send OTP via email
        const emailSent = await EmailService.sendOTP({
          email,
          otp: code,
          name: existingUser.name,
          isSignIn: true,
        });

        const includeCode = process.env.RETURN_OTP_IN_RESPONSE === "true";

        return res.json({
          ok: true,
          emailExists: true,
          message: emailSent
            ? "Email already exists. OTP sent to email for signin"
            : "Email already exists. OTP generated (email service unavailable)",
          user: { email: existingUser.email, name: existingUser.name },
          code: includeCode ? code : undefined,
          emailServiceWorking: emailSent,
        });
      }

      // Generate OTP for new user signup
      const code = String(Math.floor(100000 + Math.random() * 900000));
      await store.setOtp(email, code, 5 * 60 * 1000);

      // Send OTP via email
      const emailSent = await EmailService.sendOTP({
        email,
        otp: code,
        isSignIn: false,
      });

      const includeCode = process.env.RETURN_OTP_IN_RESPONSE === "true";

      res.json({
        ok: true,
        emailExists: false,
        message: emailSent
          ? "OTP sent to email"
          : "OTP generated (email service unavailable)",
        code: includeCode ? code : undefined,
        emailServiceWorking: emailSent,
      });
    }
  },

  verifyOtp: async (req: Request, res: Response) => {
    const parsed = verifyOtpSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;
    const { email, name, dateOfBirth, code } = parsed.data;
    const ok = await store.verifyOtp(email, code);
    if (!ok) return res.status(401).json({ error: "InvalidOrExpiredOtp" });
    const user = await store.upsertUserByEmail(email, name, dateOfBirth, "otp");
    const token = signJwt({ id: user.id, email: user.email, name: user.name });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  },

  googleCallback: (req: Request, res: Response) => {
    const user: any = (req as any).user;
    const token = signJwt({ id: user.id, email: user.email, name: user.name });
    const frontend = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(
      `${frontend}/oauth-callback#token=${encodeURIComponent(token)}`
    );
  },

  googleFailure: (_req: Request, res: Response) => {
    res.status(401).json({ error: "GoogleAuthFailed" });
  },

  signinOtp: async (req: Request, res: Response) => {
    const parsed = signinOtpSchema.safeParse(req.body);
    if (!parsed.success) throw parsed.error;
    const { email, code } = parsed.data;

    // Check if user exists
    const existingUser = await store.getUserByEmail(email);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify OTP
    const ok = await store.verifyOtp(email, code);
    if (!ok) return res.status(401).json({ error: "InvalidOrExpiredOtp" });

    const token = signJwt({
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
    });
    res.json({
      token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
    });
  },

  getMe: (req: AuthedRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    res.json({ user });
  },
};

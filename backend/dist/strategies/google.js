"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const store_1 = require("../data/store");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            const name = profile.displayName || profile.name?.givenName || "User";
            if (!email)
                return done(new Error("Google account has no email"));
            const user = await store_1.store.upsertUserByEmail(email, name, undefined, "google");
            return done(null, user);
        }
        catch (error) {
            return done(error);
        }
    }));
    passport_1.default.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await store_1.store.getUserById(id);
            done(null, user || null);
        }
        catch (error) {
            done(error);
        }
    });
}

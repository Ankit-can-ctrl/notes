import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { store } from "../data/store";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const BACKEND_URL =
  process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName || profile.name?.givenName || "User";
          if (!email) return done(new Error("Google account has no email"));
          const user = await store.upsertUserByEmail(
            email,
            name,
            undefined,
            "google"
          );
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await store.getUserById(id);
      done(null, user || null);
    } catch (error) {
      done(error);
    }
  });
}

export {}; // ensure module

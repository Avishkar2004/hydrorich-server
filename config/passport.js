import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { findUserByEmail, createUser } from "../models/userModel.js";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const existingUser = await findUserByEmail(profile.emails[0].value);
        
        if (existingUser) {
          return done(null, existingUser);
        }

        // Create new user if doesn't exist
        const newUser = {
          name: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
          email: profile.emails[0].value,
          password: null, // No password for Google auth
          provider: 'google'
        };

        const user = await createUser(newUser);
        return done(null, user);
      } catch (error) {
        console.error("Google auth error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

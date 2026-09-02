import express from "express";
import connectodb from "./config/database.js";
import authrouter from "./routes/user.routes.js";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import { config } from "./config/config.js";
import passportGoogle from "passport-google-oauth20";
import productrouter from "./routes/product.routes.js";
const { Strategy: GoogleStrategy } = passportGoogle;

const app = express();

app.use(morgan("dev"));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

connectodb();
app.use(passport.initialize());
passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      console.log("GOOGLE PROFILE:");
      console.log(profile);

      try {
        return done(null, profile);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

app.use("/api/auth", authrouter);
app.use("/api/product",productrouter)
export default app;
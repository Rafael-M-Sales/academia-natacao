import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { upsertUser, findUserById } from "../db/database.js";
import { JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, CLIENT_URL } from "../config.js";
import { validate } from "../middleware/validate.js";

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const router = express.Router();

function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };
}

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        const user = await upsertUser({
          email: profile.emails[0].value,
          name: profile.displayName,
          role: "admin",
          googleId: profile.id,
        });
        return done(null, toPublicUser(user));
      }
    )
  );
} else {
  console.warn(
    "[Auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google OAuth disabled."
  );
}

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ message: "ADMIN_PASSWORD não configurado no .env" });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  const user = toPublicUser(
    await upsertUser({ email, name: "Administrador", role: "admin" })
  );

  const token = jwt.sign(
    { id: user.id, email: user.email, role: "admin" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({ token, user });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user =
      toPublicUser(await findUserById(payload.id)) ||
      toPublicUser({ id: payload.id, email: payload.email, name: "Admin", role: "admin" });
    res.json({ user });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

router.get("/google", (req, res, next) => {
  if (!GOOGLE_CLIENT_ID) {
    return res
      .status(501)
      .json({ message: "Google OAuth not configured on this server." });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.redirect(`${CLIENT_URL}#token=${token}`);
  }
);

export default router;

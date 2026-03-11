import path from "path";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import { getUserById, getUserByProviderId } from "./supabase-users";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export type CurrentUser = { userId: string; username: string | null };

/** Decode JWT and return current user id (from users table). Same secret as auth-service. */
export async function getCurrentUserFromRequest(req: express.Request): Promise<CurrentUser | null> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; provider?: string };
    const sub = decoded?.sub;
    if (!sub) return null;
    let user: { id?: string; username?: string | null } | null;
    if (decoded?.provider === "password") {
      user = await getUserById(sub);
    } else {
      const provider = decoded?.provider === "linkedin" ? "linkedin" : "github";
      user = await getUserByProviderId(provider, sub);
    }
    if (!user) return null;
    return {
      userId: (user as { id?: string }).id ?? "",
      username: user.username ?? null,
    };
  } catch {
    return null;
  }
}

/** Middleware: require auth, 401 if not. */
export function requireAuth(
  req: express.Request & { currentUser?: CurrentUser },
  res: express.Response,
  next: express.NextFunction
): void {
  getCurrentUserFromRequest(req)
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "Missing or invalid authorization" });
        return;
      }
      (req as express.Request & { currentUser: CurrentUser }).currentUser = user;
      next();
    })
    .catch((err) => next(err));
}

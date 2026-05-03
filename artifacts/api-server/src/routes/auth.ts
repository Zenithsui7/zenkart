import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterUserBody, LoginUserBody } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "zenkart_salt").digest("hex");
}

function generateToken(userId: number): string {
  return Buffer.from(`${userId}:${Date.now()}:zenkart`).toString("base64");
}

function parseToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userIdStr] = decoded.split(":");
    const userId = parseInt(userIdStr, 10);
    return isNaN(userId) ? null : userId;
  } catch {
    return null;
  }
}

export { parseToken };

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    passwordHash: hashPassword(parsed.data.password),
    role: "buyer",
    walletBalance: "0",
    zenCoins: 100,
    isVerified: false,
  }).returning();

  const token = generateToken(user.id);
  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? undefined,
      role: user.role,
      avatarUrl: user.avatarUrl ?? undefined,
      walletBalance: parseFloat(user.walletBalance),
      zenCoins: user.zenCoins,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(parsed.data.password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken(user.id);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? undefined,
      role: user.role,
      avatarUrl: user.avatarUrl ?? undefined,
      walletBalance: parseFloat(user.walletBalance),
      zenCoins: user.zenCoins,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const userId = parseToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? undefined,
    role: user.role,
    avatarUrl: user.avatarUrl ?? undefined,
    walletBalance: parseFloat(user.walletBalance),
    zenCoins: user.zenCoins,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
  });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ message: "Logged out successfully" });
});

export default router;

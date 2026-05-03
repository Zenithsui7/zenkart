import { Router, type IRouter } from "express";
import { db, walletTransactionsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { AddMoneyToWalletBody } from "@workspace/api-zod";
import { parseToken } from "./auth";

const router: IRouter = Router();

function getUserId(req: any): number {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return 1;
  const token = authHeader.slice(7);
  return parseToken(token) ?? 1;
}

function formatTx(t: any) {
  return {
    id: t.id, type: t.type, amount: parseFloat(t.amount),
    description: t.description, reference: t.reference ?? null,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
  };
}

router.get("/wallet", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const transactions = await db.select().from(walletTransactionsTable).where(eq(walletTransactionsTable.userId, userId)).orderBy(desc(walletTransactionsTable.createdAt)).limit(5);

  res.json({
    balance: user ? parseFloat(user.walletBalance) : 0,
    zenCoins: user?.zenCoins ?? 0,
    zenCoinsValue: (user?.zenCoins ?? 0) * 0.1,
    recentTransactions: transactions.map(formatTx),
  });
});

router.get("/wallet/transactions", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const transactions = await db.select().from(walletTransactionsTable).where(eq(walletTransactionsTable.userId, userId)).orderBy(desc(walletTransactionsTable.createdAt));
  res.json(transactions.map(formatTx));
});

router.post("/wallet/add-money", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = AddMoneyToWalletBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  await db.insert(walletTransactionsTable).values({
    userId, type: "credit", amount: parsed.data.amount.toString(),
    description: `Added money via ${parsed.data.paymentMethod.toUpperCase()}`,
  });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const newBalance = (parseFloat(user?.walletBalance ?? "0") + parsed.data.amount);
  await db.update(usersTable).set({ walletBalance: newBalance.toString() }).where(eq(usersTable.id, userId));

  const transactions = await db.select().from(walletTransactionsTable).where(eq(walletTransactionsTable.userId, userId)).orderBy(desc(walletTransactionsTable.createdAt)).limit(5);
  res.json({ balance: newBalance, zenCoins: user?.zenCoins ?? 0, zenCoinsValue: (user?.zenCoins ?? 0) * 0.1, recentTransactions: transactions.map(formatTx) });
});

export default router;

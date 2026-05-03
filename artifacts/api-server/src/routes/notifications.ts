import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { parseToken } from "./auth";

const router: IRouter = Router();

function getUserId(req: any): number {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return 1;
  const token = authHeader.slice(7);
  return parseToken(token) ?? 1;
}

function formatNotification(n: any) {
  return {
    id: n.id, title: n.title, body: n.body, type: n.type, isRead: n.isRead,
    imageUrl: n.imageUrl ?? null, actionUrl: n.actionUrl ?? null,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : n.createdAt,
  };
}

router.get("/notifications", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const notifications = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId)).orderBy(desc(notificationsTable.createdAt));
  res.json(notifications.map(formatNotification));
});

router.post("/notifications/:notificationId/read", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.notificationId) ? req.params.notificationId[0] : req.params.notificationId;
  const notificationId = parseInt(raw, 10);
  const [notification] = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, notificationId)).returning();
  if (!notification) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json(formatNotification(notification));
});

router.post("/notifications/read-all", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.userId, userId));
  res.json({ message: "All notifications marked as read" });
});

export default router;

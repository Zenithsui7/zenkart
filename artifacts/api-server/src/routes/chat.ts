import { Router, type IRouter } from "express";
import { db, conversationsTable, messagesTable, usersTable, listingsTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { SendMessageBody, StartConversationBody } from "@workspace/api-zod";
import { parseToken } from "./auth";

const router: IRouter = Router();

function getUserId(req: any): number {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return 1;
  const token = authHeader.slice(7);
  return parseToken(token) ?? 1;
}

router.get("/chat/conversations", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const convos = await db.select().from(conversationsTable).where(or(eq(conversationsTable.buyerId, userId), eq(conversationsTable.sellerId, userId))).orderBy(desc(conversationsTable.updatedAt));
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));

  const enriched = await Promise.all(convos.map(async c => {
    const otherUserId = c.buyerId === userId ? c.sellerId : c.buyerId;
    const otherUser = userMap.get(otherUserId);
    const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, c.id)).orderBy(desc(messagesTable.createdAt)).limit(1);
    const unread = (await db.select().from(messagesTable).where(eq(messagesTable.conversationId, c.id))).filter(m => !m.isRead && m.senderId !== userId).length;

    let listingTitle = null, listingImage = null;
    if (c.listingId) {
      const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, c.listingId)).limit(1);
      if (listing) { listingTitle = listing.title; listingImage = listing.images?.[0] ?? null; }
    }

    return {
      id: c.id, listingId: c.listingId ?? null, listingTitle, listingImage,
      otherUserId, otherUserName: otherUser?.name ?? "User",
      otherUserAvatar: otherUser?.avatarUrl ?? null,
      lastMessage: msgs[0]?.text ?? null, unreadCount: unread,
      updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
    };
  }));

  res.json(enriched);
});

router.get("/chat/conversations/:conversationId/messages", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const conversationId = parseInt(raw, 10);
  const msgs = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, conversationId)).orderBy(messagesTable.createdAt);
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u.name]));

  res.json(msgs.map(m => ({
    id: m.id, conversationId: m.conversationId, senderId: m.senderId,
    senderName: userMap.get(m.senderId) ?? "User", text: m.text, isRead: m.isRead,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  })));
});

router.post("/chat/conversations/:conversationId/messages", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const raw = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;
  const conversationId = parseInt(raw, 10);

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [message] = await db.insert(messagesTable).values({
    conversationId, senderId: userId, text: parsed.data.text, isRead: false,
  }).returning();

  await db.update(conversationsTable).set({ updatedAt: new Date() }).where(eq(conversationsTable.id, conversationId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.status(201).json({
    id: message.id, conversationId: message.conversationId, senderId: message.senderId,
    senderName: user?.name ?? "User", text: message.text, isRead: message.isRead,
    createdAt: message.createdAt.toISOString(),
  });
});

router.post("/chat/start", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = StartConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [convo] = await db.insert(conversationsTable).values({
    buyerId: userId, sellerId: parsed.data.sellerId, listingId: parsed.data.listingId,
  }).returning();

  await db.insert(messagesTable).values({
    conversationId: convo.id, senderId: userId, text: parsed.data.initialMessage, isRead: false,
  });

  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.data.sellerId)).limit(1);
  let listingTitle = null, listingImage = null;
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, parsed.data.listingId)).limit(1);
  if (listing) { listingTitle = listing.title; listingImage = listing.images?.[0] ?? null; }

  res.status(201).json({
    id: convo.id, listingId: convo.listingId ?? null, listingTitle, listingImage,
    otherUserId: parsed.data.sellerId, otherUserName: seller?.name ?? "Seller",
    otherUserAvatar: seller?.avatarUrl ?? null,
    lastMessage: parsed.data.initialMessage, unreadCount: 0,
    updatedAt: convo.updatedAt instanceof Date ? convo.updatedAt.toISOString() : convo.updatedAt,
  });
});

export default router;

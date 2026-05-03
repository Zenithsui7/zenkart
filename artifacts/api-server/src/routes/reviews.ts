import { Router, type IRouter } from "express";
import { db, reviewsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ListReviewsParams, CreateReviewParams, CreateReviewBody } from "@workspace/api-zod";
import { parseToken } from "./auth";

const router: IRouter = Router();

function getUserId(req: any): number {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return 1;
  const token = authHeader.slice(7);
  return parseToken(token) ?? 1;
}

router.get("/products/:productId/reviews", async (req, res): Promise<void> => {
  const params = ListReviewsParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.productId, params.data.productId)).orderBy(desc(reviewsTable.createdAt));
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(reviews.map(r => ({
    id: r.id, productId: r.productId, userId: r.userId,
    userName: userMap.get(r.userId)?.name ?? "Anonymous",
    userAvatar: userMap.get(r.userId)?.avatarUrl ?? null,
    rating: r.rating, title: r.title, text: r.text, images: r.images,
    isVerifiedPurchase: r.isVerifiedPurchase, helpfulCount: r.helpfulCount,
    isFakeReview: r.isFakeReview,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  })));
});

router.post("/products/:productId/reviews", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = CreateReviewParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [review] = await db.insert(reviewsTable).values({
    productId: params.data.productId,
    userId,
    rating: parsed.data.rating,
    title: parsed.data.title,
    text: parsed.data.text,
    images: parsed.data.images ?? [],
    isVerifiedPurchase: true,
    helpfulCount: 0,
    isFakeReview: false,
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  res.status(201).json({
    id: review.id, productId: review.productId, userId: review.userId,
    userName: user?.name ?? "User", userAvatar: user?.avatarUrl ?? null,
    rating: review.rating, title: review.title, text: review.text, images: review.images,
    isVerifiedPurchase: review.isVerifiedPurchase, helpfulCount: review.helpfulCount,
    isFakeReview: review.isFakeReview,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;

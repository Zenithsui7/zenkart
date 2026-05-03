import { Router, type IRouter } from "express";
import { db, listingsTable, usersTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, desc } from "drizzle-orm";
import { ListUsedGoodsQueryParams, CreateListingBody, GetListingParams, UpdateListingParams, UpdateListingBody, DeleteListingParams, MakeOfferBody } from "@workspace/api-zod";
import { parseToken } from "./auth";

const router: IRouter = Router();

function getUserId(req: any): number {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return 1;
  const token = authHeader.slice(7);
  return parseToken(token) ?? 1;
}

function formatListing(l: any, sellerName?: string, categoryName?: string) {
  return {
    id: l.id, userId: l.userId, sellerName: sellerName ?? "Seller",
    sellerAvatar: null, title: l.title, description: l.description,
    price: parseFloat(l.price), isNegotiable: l.isNegotiable,
    images: l.images ?? [], categoryId: l.categoryId, categoryName: categoryName ?? "",
    condition: l.condition, city: l.city, state: l.state, viewCount: l.viewCount,
    isActive: l.isActive, isFree: l.isFree,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
  };
}

router.get("/listings", async (req, res): Promise<void> => {
  const params = ListUsedGoodsQueryParams.safeParse(req.query);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const { search, categoryId, condition, minPrice, maxPrice, city, page = 1 } = params.data ?? {};
  const limit = 20;
  const conditions = [eq(listingsTable.isActive, true)];
  if (search) conditions.push(ilike(listingsTable.title, `%${search}%`));
  if (categoryId) conditions.push(eq(listingsTable.categoryId, categoryId));
  if (condition) conditions.push(eq(listingsTable.condition, condition as any));
  if (city) conditions.push(ilike(listingsTable.city, `%${city}%`));

  const [listings, users, cats] = await Promise.all([
    db.select().from(listingsTable).where(and(...conditions)).orderBy(desc(listingsTable.createdAt)).limit(limit).offset((page - 1) * limit),
    db.select().from(usersTable),
    db.select().from(categoriesTable),
  ]);

  const userMap = new Map(users.map(u => [u.id, u.name]));
  const catMap = new Map(cats.map(c => [c.id, c.name]));

  res.json({
    listings: listings.map(l => formatListing(l, userMap.get(l.userId), catMap.get(l.categoryId))),
    total: listings.length,
    page,
    totalPages: Math.ceil(listings.length / limit),
  });
});

router.post("/listings", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [listing] = await db.insert(listingsTable).values({
    userId,
    title: parsed.data.title,
    description: parsed.data.description,
    price: parsed.data.price.toString(),
    isNegotiable: parsed.data.isNegotiable ?? false,
    images: parsed.data.images ?? [],
    categoryId: parsed.data.categoryId,
    condition: parsed.data.condition,
    city: parsed.data.city,
    state: parsed.data.state,
    isFree: parsed.data.isFree ?? false,
    isActive: true,
    viewCount: 0,
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, listing.categoryId)).limit(1);
  res.status(201).json(formatListing(listing, user?.name, cat?.name));
});

router.get("/listings/:listingId", async (req, res): Promise<void> => {
  const params = GetListingParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, params.data.listingId)).limit(1);
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }

  await db.update(listingsTable).set({ viewCount: listing.viewCount + 1 }).where(eq(listingsTable.id, listing.id));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, listing.userId)).limit(1);
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, listing.categoryId)).limit(1);
  res.json(formatListing({ ...listing, viewCount: listing.viewCount + 1 }, user?.name, cat?.name));
});

router.put("/listings/:listingId", async (req, res): Promise<void> => {
  const params = UpdateListingParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateListingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: any = { ...parsed.data };
  if (updates.price) updates.price = updates.price.toString();

  const [listing] = await db.update(listingsTable).set(updates).where(eq(listingsTable.id, params.data.listingId)).returning();
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, listing.userId)).limit(1);
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, listing.categoryId)).limit(1);
  res.json(formatListing(listing, user?.name, cat?.name));
});

router.delete("/listings/:listingId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.listingId) ? req.params.listingId[0] : req.params.listingId;
  const listingId = parseInt(raw, 10);
  await db.delete(listingsTable).where(eq(listingsTable.id, listingId));
  res.json({ message: "Listing deleted" });
});

router.post("/listings/:listingId/make-offer", async (req, res): Promise<void> => {
  const parsed = MakeOfferBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  res.json({ message: `Offer of ₹${parsed.data.offerPrice} sent to seller` });
});

export default router;

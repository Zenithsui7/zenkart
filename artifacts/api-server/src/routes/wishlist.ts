import { Router, type IRouter } from "express";
import { db, wishlistTable, productsTable, categoriesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddToWishlistParams, RemoveFromWishlistParams } from "@workspace/api-zod";
import { parseToken } from "./auth";

const router: IRouter = Router();

function getUserId(req: any): number {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return 1;
  const token = authHeader.slice(7);
  return parseToken(token) ?? 1;
}

function formatProduct(p: any, categoryName?: string, sellerName?: string) {
  return {
    id: p.id, title: p.title, description: p.description,
    price: parseFloat(p.price), mrp: parseFloat(p.mrp), discountPercent: parseFloat(p.discountPercent),
    images: p.images ?? [], categoryId: p.categoryId, categoryName: categoryName ?? "",
    sellerId: p.sellerId, sellerName: sellerName ?? "", brand: p.brand, stock: p.stock,
    rating: parseFloat(p.rating ?? "0"), reviewCount: p.reviewCount ?? 0,
    isFeatured: p.isFeatured ?? false, isFlashSale: p.isFlashSale ?? false,
    badge: p.badge ?? null, deliveryDays: p.deliveryDays ?? 3,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

router.get("/wishlist", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const items = await db.select().from(wishlistTable).where(eq(wishlistTable.userId, userId));
  const [cats, sellers] = await Promise.all([db.select().from(categoriesTable), db.select().from(usersTable)]);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerMap = new Map(sellers.map(s => [s.id, s.name]));

  const enriched = await Promise.all(items.map(async item => {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
    return {
      id: item.id, productId: item.productId,
      product: product ? formatProduct(product, catMap.get(product.categoryId), sellerMap.get(product.sellerId)) : null,
      addedAt: item.addedAt instanceof Date ? item.addedAt.toISOString() : item.addedAt,
    };
  }));

  res.json(enriched.filter(i => i.product));
});

router.post("/wishlist/:productId", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = AddToWishlistParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const existing = await db.select().from(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, params.data.productId))).limit(1);
  if (existing.length > 0) { res.json({ id: existing[0].id, productId: existing[0].productId, product: null, addedAt: existing[0].addedAt.toISOString() }); return; }

  const [item] = await db.insert(wishlistTable).values({ userId, productId: params.data.productId }).returning();
  res.json({ id: item.id, productId: item.productId, product: null, addedAt: item.addedAt.toISOString() });
});

router.delete("/wishlist/:productId", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = RemoveFromWishlistParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  await db.delete(wishlistTable).where(and(eq(wishlistTable.userId, userId), eq(wishlistTable.productId, params.data.productId)));
  res.json({ message: "Removed from wishlist" });
});

export default router;

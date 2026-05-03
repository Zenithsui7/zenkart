import { Router, type IRouter } from "express";
import { db, bannersTable, productsTable, listingsTable, categoriesTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

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

function formatListing(l: any, sellerName?: string, categoryName?: string) {
  return {
    id: l.id, userId: l.userId, sellerName: sellerName ?? "Seller", sellerAvatar: null,
    title: l.title, description: l.description, price: parseFloat(l.price),
    isNegotiable: l.isNegotiable, images: l.images ?? [],
    categoryId: l.categoryId, categoryName: categoryName ?? "",
    condition: l.condition, city: l.city, state: l.state, viewCount: l.viewCount,
    isActive: l.isActive, isFree: l.isFree,
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
  };
}

router.get("/dashboard/banners", async (_req, res): Promise<void> => {
  const banners = await db.select().from(bannersTable);
  res.json(banners);
});

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [banners, allProducts, recentListings, cats, sellers] = await Promise.all([
    db.select().from(bannersTable),
    db.select().from(productsTable),
    db.select().from(listingsTable).where(eq(listingsTable.isActive, true)).orderBy(desc(listingsTable.createdAt)).limit(6),
    db.select().from(categoriesTable),
    db.select().from(usersTable),
  ]);

  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerMap = new Map(sellers.map(s => [s.id, s.name]));

  const featured = allProducts.filter(p => p.isFeatured).slice(0, 8);
  const flashSale = allProducts.filter(p => p.isFlashSale).slice(0, 8);
  const trending = allProducts.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0)).slice(0, 8);
  const dailyDeals = allProducts.filter(p => parseFloat(p.discountPercent) >= 20).slice(0, 8);

  res.json({
    banners,
    flashSale: {
      products: flashSale.map(p => formatProduct(p, catMap.get(p.categoryId), sellerMap.get(p.sellerId))),
      endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    },
    featuredProducts: featured.map(p => formatProduct(p, catMap.get(p.categoryId), sellerMap.get(p.sellerId))),
    trendingProducts: trending.map(p => formatProduct(p, catMap.get(p.categoryId), sellerMap.get(p.sellerId))),
    categories: cats,
    dailyDeals: dailyDeals.map(p => formatProduct(p, catMap.get(p.categoryId), sellerMap.get(p.sellerId))),
    recentListings: recentListings.map(l => formatListing(l, sellerMap.get(l.userId), catMap.get(l.categoryId))),
  });
});

export default router;

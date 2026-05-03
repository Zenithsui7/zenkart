import { Router, type IRouter } from "express";
import { db, cartItemsTable, productsTable, categoriesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AddToCartBody, UpdateCartItemBody, UpdateCartItemParams, RemoveFromCartParams, ApplyCouponBody } from "@workspace/api-zod";
import { parseToken } from "./auth";

const router: IRouter = Router();

function getUserId(req: any): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return 1; // default user for demo
  const token = authHeader.slice(7);
  return parseToken(token) ?? 1;
}

function formatProduct(p: any, categoryName?: string, sellerName?: string) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: parseFloat(p.price),
    mrp: parseFloat(p.mrp),
    discountPercent: parseFloat(p.discountPercent),
    images: p.images ?? [],
    categoryId: p.categoryId,
    categoryName: categoryName ?? "",
    sellerId: p.sellerId,
    sellerName: sellerName ?? "",
    brand: p.brand,
    stock: p.stock,
    rating: parseFloat(p.rating ?? "0"),
    reviewCount: p.reviewCount ?? 0,
    isFeatured: p.isFeatured ?? false,
    isFlashSale: p.isFlashSale ?? false,
    badge: p.badge ?? null,
    deliveryDays: p.deliveryDays ?? 3,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  };
}

async function getCartResponse(userId: number) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  const [cats, sellers] = await Promise.all([
    db.select().from(categoriesTable),
    db.select().from(usersTable),
  ]);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerMap = new Map(sellers.map(s => [s.id, s.name]));

  const enriched = await Promise.all(items.map(async item => {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
    return {
      id: item.id,
      productId: item.productId,
      product: product ? formatProduct(product, catMap.get(product.categoryId), sellerMap.get(product.sellerId)) : null,
      quantity: item.quantity,
      selectedVariant: item.selectedVariant ?? null,
      savedForLater: item.savedForLater,
    };
  }));

  const activeItems = enriched.filter(i => !i.savedForLater && i.product);
  const subtotal = activeItems.reduce((sum, i) => sum + (i.product!.price * i.quantity), 0);
  const mrpTotal = activeItems.reduce((sum, i) => sum + (i.product!.mrp * i.quantity), 0);
  const discount = mrpTotal - subtotal;
  const deliveryCharge = subtotal > 499 ? 0 : 49;

  return {
    items: enriched,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    couponDiscount: 0,
    deliveryCharge,
    total: Math.round((subtotal + deliveryCharge) * 100) / 100,
    appliedCoupon: null,
    itemCount: activeItems.reduce((sum, i) => sum + i.quantity, 0),
  };
}

router.get("/cart", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  res.json(await getCartResponse(userId));
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const existing = await db.select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, parsed.data.productId))).limit(1);

  if (existing.length > 0) {
    await db.update(cartItemsTable).set({ quantity: existing[0].quantity + parsed.data.quantity }).where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({
      userId,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
      selectedVariant: parsed.data.selectedVariant ?? null,
      savedForLater: false,
    });
  }

  res.json(await getCartResponse(userId));
});

router.put("/cart/items/:itemId", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const params = UpdateCartItemParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: any = {};
  if (parsed.data.quantity !== undefined) updates.quantity = parsed.data.quantity;
  if (parsed.data.savedForLater !== undefined) updates.savedForLater = parsed.data.savedForLater;

  await db.update(cartItemsTable).set(updates).where(eq(cartItemsTable.id, params.data.itemId));
  res.json(await getCartResponse(userId));
});

router.delete("/cart/items/:itemId", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const raw = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const itemId = parseInt(raw, 10);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, itemId));
  res.json(await getCartResponse(userId));
});

router.post("/cart/coupon", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const parsed = ApplyCouponBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const cart = await getCartResponse(userId);
  const validCoupons: Record<string, number> = { "ZENKART10": 0.1, "SAVE50": 50, "NEWUSER": 100 };
  const discount = validCoupons[parsed.data.couponCode.toUpperCase()];
  if (!discount) { res.status(400).json({ error: "Invalid or expired coupon" }); return; }

  const couponDiscount = discount < 1 ? Math.round(cart.subtotal * discount) : discount;
  res.json({ ...cart, couponDiscount, total: Math.max(0, cart.total - couponDiscount), appliedCoupon: parsed.data.couponCode });
});

export default router;

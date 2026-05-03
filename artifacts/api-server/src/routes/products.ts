import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable, usersTable } from "@workspace/db";
import { eq, ilike, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { ListProductsQueryParams, GetProductParams, GetRelatedProductsParams } from "@workspace/api-zod";

const router: IRouter = Router();

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
    categoryName: categoryName ?? p.categoryName ?? "",
    sellerId: p.sellerId,
    sellerName: sellerName ?? p.sellerName ?? "",
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

router.get("/products", async (req, res): Promise<void> => {
  const params = ListProductsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { search, categoryId, minPrice, maxPrice, sortBy, brand, page = 1, limit = 20 } = params.data;

  const conditions = [];
  if (search) conditions.push(ilike(productsTable.title, `%${search}%`));
  if (categoryId) conditions.push(eq(productsTable.categoryId, categoryId));
  if (minPrice) conditions.push(gte(sql`${productsTable.price}::numeric`, minPrice));
  if (maxPrice) conditions.push(lte(sql`${productsTable.price}::numeric`, maxPrice));
  if (brand) conditions.push(ilike(productsTable.brand, `%${brand}%`));

  let orderBy;
  switch (sortBy) {
    case "price_asc": orderBy = asc(productsTable.price); break;
    case "price_desc": orderBy = desc(productsTable.price); break;
    case "rating": orderBy = desc(productsTable.rating); break;
    case "newest": orderBy = desc(productsTable.createdAt); break;
    default: orderBy = desc(productsTable.isFeatured);
  }

  const offset = (page - 1) * limit;
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [products, cats, sellers] = await Promise.all([
    db.select().from(productsTable).where(where).orderBy(orderBy).limit(limit).offset(offset),
    db.select().from(categoriesTable),
    db.select().from(usersTable),
  ]);

  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerMap = new Map(sellers.map(s => [s.id, s.name]));

  const total = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where);

  res.json({
    products: products.map(p => formatProduct(p, catMap.get(p.categoryId), sellerMap.get(p.sellerId))),
    total: Number(total[0]?.count ?? 0),
    page,
    totalPages: Math.ceil(Number(total[0]?.count ?? 0) / limit),
  });
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const [products, cats, sellers] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isFeatured, true)).orderBy(desc(productsTable.rating)).limit(12),
    db.select().from(categoriesTable),
    db.select().from(usersTable),
  ]);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerMap = new Map(sellers.map(s => [s.id, s.name]));
  res.json(products.map(p => formatProduct(p, catMap.get(p.categoryId), sellerMap.get(p.sellerId))));
});

router.get("/products/flash-sale", async (_req, res): Promise<void> => {
  const [products, cats, sellers] = await Promise.all([
    db.select().from(productsTable).where(eq(productsTable.isFlashSale, true)).orderBy(desc(productsTable.discountPercent)).limit(10),
    db.select().from(categoriesTable),
    db.select().from(usersTable),
  ]);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerMap = new Map(sellers.map(s => [s.id, s.name]));

  const endsAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
  res.json({
    products: products.map(p => formatProduct(p, catMap.get(p.categoryId), sellerMap.get(p.sellerId))),
    endsAt,
  });
});

router.get("/products/trending", async (_req, res): Promise<void> => {
  const [products, cats, sellers] = await Promise.all([
    db.select().from(productsTable).orderBy(desc(productsTable.reviewCount)).limit(12),
    db.select().from(categoriesTable),
    db.select().from(usersTable),
  ]);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerMap = new Map(sellers.map(s => [s.id, s.name]));
  res.json(products.map(p => formatProduct(p, catMap.get(p.categoryId), sellerMap.get(p.sellerId))));
});

router.get("/products/recommendations", async (_req, res): Promise<void> => {
  const [products, cats, sellers] = await Promise.all([
    db.select().from(productsTable).orderBy(sql`RANDOM()`).limit(10),
    db.select().from(categoriesTable),
    db.select().from(usersTable),
  ]);
  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerMap = new Map(sellers.map(s => [s.id, s.name]));
  res.json(products.map(p => formatProduct(p, catMap.get(p.categoryId), sellerMap.get(p.sellerId))));
});

router.get("/products/:productId", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.productId)).limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [cats, sellers] = await Promise.all([
    db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1),
    db.select().from(usersTable).where(eq(usersTable.id, product.sellerId)).limit(1),
  ]);

  const base = formatProduct(product, cats[0]?.name, sellers[0]?.name);
  res.json({
    ...base,
    variants: [
      { id: 1, type: "Color", value: "Black", stock: Math.floor(product.stock * 0.5), priceAdjustment: 0 },
      { id: 2, type: "Color", value: "White", stock: Math.floor(product.stock * 0.3), priceAdjustment: 0 },
      { id: 3, type: "Size", value: "M", stock: Math.floor(product.stock * 0.4), priceAdjustment: 0 },
      { id: 4, type: "Size", value: "L", stock: Math.floor(product.stock * 0.3), priceAdjustment: 200 },
    ],
    emiOptions: [
      { months: 3, monthlyAmount: Math.round(parseFloat(product.price) / 3), totalAmount: parseFloat(product.price), isNoCostEmi: true },
      { months: 6, monthlyAmount: Math.round(parseFloat(product.price) / 6), totalAmount: parseFloat(product.price), isNoCostEmi: true },
      { months: 12, monthlyAmount: Math.round(parseFloat(product.price) / 12 * 1.1), totalAmount: parseFloat(product.price) * 1.1, isNoCostEmi: false },
    ],
    specifications: { Brand: product.brand, Category: cats[0]?.name ?? "", Stock: String(product.stock) },
    highlights: ["Free delivery on orders above ₹499", "7-day easy returns", "1 year warranty", "100% authentic product"],
  });
});

router.get("/products/:productId/related", async (req, res): Promise<void> => {
  const params = GetRelatedProductsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, params.data.productId)).limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const [related, cats, sellers] = await Promise.all([
    db.select().from(productsTable).where(and(eq(productsTable.categoryId, product.categoryId), sql`${productsTable.id} != ${product.id}`)).orderBy(sql`RANDOM()`).limit(6),
    db.select().from(categoriesTable),
    db.select().from(usersTable),
  ]);

  const catMap = new Map(cats.map(c => [c.id, c.name]));
  const sellerMap = new Map(sellers.map(s => [s.id, s.name]));
  res.json(related.map(p => formatProduct(p, catMap.get(p.categoryId), sellerMap.get(p.sellerId))));
});

export default router;

import { Router, type IRouter } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";
import { ShareProductBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reseller/products", async (req, res): Promise<void> => {
  const { categoryId, search } = req.query;

  let products = await db.select().from(productsTable);
  if (search) products = products.filter(p => p.title.toLowerCase().includes((search as string).toLowerCase()));
  if (categoryId) products = products.filter(p => p.categoryId === parseInt(categoryId as string, 10));

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));

  res.json(products.map(p => ({
    id: p.id, title: p.title, images: p.images ?? [],
    wholesalePrice: Math.round(parseFloat(p.price) * 0.7),
    mrp: parseFloat(p.mrp),
    minMargin: 10, maxMargin: 40,
    categoryId: p.categoryId, categoryName: catMap.get(p.categoryId) ?? "",
    brand: p.brand, stock: p.stock, totalResellers: Math.floor(Math.random() * 50) + 5,
  })));
});

router.post("/reseller/share", async (req, res): Promise<void> => {
  const parsed = ShareProductBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.productId)).limit(1);
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const wholesalePrice = Math.round(parseFloat(product.price) * 0.7);
  const profit = parsed.data.sellingPrice - wholesalePrice;
  const commission = Math.round(profit * 0.1);

  res.json({
    shareUrl: `https://zenkart.in/p/${product.id}?ref=reseller`,
    shareText: `Check out ${product.title} at just ₹${parsed.data.sellingPrice}! Shop now on ZenKart.`,
    commission,
    profit,
  });
});

router.get("/reseller/earnings", async (_req, res): Promise<void> => {
  res.json({
    totalEarnings: 12450,
    pendingEarnings: 2300,
    thisMonthEarnings: 4500,
    totalOrders: 47,
    successfulOrders: 43,
    recentCommissions: [
      { id: 1, productTitle: "boAt Rockerz 450 Bluetooth Headphone", amount: 180, status: "paid", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, productTitle: "Realme C55 (6GB+128GB)", amount: 350, status: "pending", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 3, productTitle: "Nike Men's Running Shoes", amount: 220, status: "paid", createdAt: new Date().toISOString() },
    ],
  });
});

export default router;

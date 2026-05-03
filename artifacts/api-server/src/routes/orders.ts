import { Router, type IRouter } from "express";
import { db, ordersTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateOrderBody, ListOrdersQueryParams, GetOrderParams, CancelOrderParams } from "@workspace/api-zod";
import { parseToken } from "./auth";

const router: IRouter = Router();

function getUserId(req: any): number {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return 1;
  const token = authHeader.slice(7);
  return parseToken(token) ?? 1;
}

function formatOrder(o: any) {
  const items = Array.isArray(o.itemsJson) ? o.itemsJson : JSON.parse(o.itemsJson as string);
  return {
    id: o.id,
    userId: o.userId,
    items,
    subtotal: parseFloat(o.subtotal),
    total: parseFloat(o.total),
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    deliveryAddress: o.deliveryAddress,
    expectedDelivery: o.expectedDelivery ?? null,
    createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = ListOrdersQueryParams.safeParse(req.query);

  let query = db.select().from(ordersTable).where(eq(ordersTable.userId, userId)).orderBy(desc(ordersTable.createdAt));
  const orders = await query;
  const filtered = params.data?.status ? orders.filter(o => o.status === params.data!.status) : orders;
  res.json(filtered.map(formatOrder));
});

router.post("/orders", async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const cartItems = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  if (cartItems.length === 0) { res.status(400).json({ error: "Cart is empty" }); return; }

  const itemsWithProducts = await Promise.all(cartItems.map(async item => {
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
    return { item, product };
  }));

  const validItems = itemsWithProducts.filter(i => i.product);
  const subtotal = validItems.reduce((sum, { item, product }) => sum + parseFloat(product!.price) * item.quantity, 0);
  const total = subtotal > 499 ? subtotal : subtotal + 49;

  const orderItems = validItems.map(({ item, product }) => ({
    productId: item.productId,
    productTitle: product!.title,
    productImage: product!.images[0] ?? "",
    quantity: item.quantity,
    price: parseFloat(product!.price),
    variant: item.selectedVariant ?? null,
  }));

  const expectedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" });

  const [order] = await db.insert(ordersTable).values({
    userId,
    itemsJson: orderItems,
    subtotal: subtotal.toString(),
    total: total.toString(),
    status: parsed.data.paymentMethod === "cod" ? "confirmed" : "confirmed",
    paymentMethod: parsed.data.paymentMethod,
    paymentStatus: parsed.data.paymentMethod === "cod" ? "pending" : "paid",
    deliveryAddress: `Address ID: ${parsed.data.addressId}`,
    expectedDelivery,
  }).returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  res.status(201).json(formatOrder(order));
});

router.get("/orders/:orderId", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.orderId)).limit(1);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }

  const statusTimeline = ["pending", "confirmed", "processing", "shipped", "delivered"];
  const currentIdx = statusTimeline.indexOf(order.status);
  const trackingEvents = statusTimeline.map((status, idx) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    description: {
      pending: "Order placed successfully",
      confirmed: "Payment confirmed, seller notified",
      processing: "Seller is packing your order",
      shipped: "Order shipped via BlueDart",
      delivered: "Order delivered",
    }[status] ?? status,
    timestamp: new Date(order.createdAt.getTime() + idx * 12 * 60 * 60 * 1000).toISOString(),
    isCompleted: idx <= currentIdx,
  }));

  res.json({
    ...formatOrder(order),
    trackingEvents,
    trackingNumber: order.trackingNumber ?? `ZK${order.id}${Date.now().toString().slice(-6)}`,
    courierName: order.courierName ?? "BlueDart",
  });
});

router.post("/orders/:orderId/cancel", async (req, res): Promise<void> => {
  const params = CancelOrderParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [order] = await db.update(ordersTable).set({ status: "cancelled" }).where(eq(ordersTable.id, params.data.orderId)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(formatOrder(order));
});

export default router;

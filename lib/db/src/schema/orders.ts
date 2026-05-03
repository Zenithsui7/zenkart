import { pgTable, text, serial, integer, numeric, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"]);
export const paymentMethodEnum = pgEnum("payment_method", ["upi", "card", "netbanking", "cod", "wallet", "emi", "bnpl"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  itemsJson: jsonb("items_json").notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  deliveryAddress: text("delivery_address").notNull(),
  expectedDelivery: text("expected_delivery"),
  trackingNumber: text("tracking_number"),
  courierName: text("courier_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

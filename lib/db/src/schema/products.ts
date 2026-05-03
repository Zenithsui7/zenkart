import { pgTable, text, serial, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  mrp: numeric("mrp", { precision: 12, scale: 2 }).notNull(),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).notNull().default("0"),
  images: text("images").array().notNull().default([]),
  categoryId: integer("category_id").references(() => categoriesTable.id).notNull(),
  sellerId: integer("seller_id").references(() => usersTable.id).notNull(),
  brand: text("brand").notNull(),
  stock: integer("stock").notNull().default(0),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  isFlashSale: boolean("is_flash_sale").notNull().default(false),
  badge: text("badge"),
  deliveryDays: integer("delivery_days").notNull().default(3),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;

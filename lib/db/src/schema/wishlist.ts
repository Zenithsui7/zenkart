import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const wishlistTable = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWishlistSchema = createInsertSchema(wishlistTable).omit({ id: true, addedAt: true });
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type WishlistEntry = typeof wishlistTable.$inferSelect;

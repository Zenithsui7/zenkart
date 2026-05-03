import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => productsTable.id).notNull(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  text: text("text").notNull(),
  images: text("images").array().notNull().default([]),
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(false),
  helpfulCount: integer("helpful_count").notNull().default(0),
  isFakeReview: boolean("is_fake_review").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;

import { pgTable, text, serial, integer, numeric, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const conditionEnum = pgEnum("listing_condition", ["new", "like_new", "good", "fair"]);

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  isNegotiable: boolean("is_negotiable").notNull().default(false),
  images: text("images").array().notNull().default([]),
  categoryId: integer("category_id").references(() => categoriesTable.id).notNull(),
  condition: conditionEnum("condition").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  viewCount: integer("view_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isFree: boolean("is_free").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;

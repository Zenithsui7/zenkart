import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bannersTable = pgTable("banners", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  actionUrl: text("action_url").notNull(),
  badgeText: text("badge_text"),
});

export const insertBannerSchema = createInsertSchema(bannersTable).omit({ id: true });
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof bannersTable.$inferSelect;

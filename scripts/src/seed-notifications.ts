import { db, notificationsTable, usersTable } from "@workspace/db";
import { sql } from "drizzle-orm";

async function seedNotifications() {
  const users = await db.select().from(usersTable);
  const buyer = users.find(u => u.email === "rahul@example.com");
  if (!buyer) { console.log("Buyer not found"); return; }

  const existing = await db.select().from(notificationsTable);
  const hasNotifs = existing.some(n => n.userId === buyer.id);
  if (hasNotifs) { console.log("Notifications already seeded"); return; }

  await db.insert(notificationsTable).values([
    { userId: buyer.id, title: "Welcome to ZenKart!", body: "Your account is ready. You have received 250 ZenCoins as a welcome bonus. Start shopping!", type: "system" as const, isRead: false },
    { userId: buyer.id, title: "Flash Sale Starts Now!", body: "Up to 80% off on Electronics! Hurry, sale ends in 6 hours.", type: "deal" as const, isRead: false, imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=200", actionUrl: "/products?isFlashSale=true" },
    { userId: buyer.id, title: "New arrivals in Electronics", body: "3 new smartphones just listed. Check them out before they sell out!", type: "deal" as const, isRead: true },
  ]);
  console.log("Notifications seeded!");
}

seedNotifications().catch(console.error).finally(() => process.exit(0));

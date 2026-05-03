# ZenKart

## Overview

ZenKart is a next-generation super e-commerce platform for India combining the best features of Amazon, Flipkart, Meesho, and OLX. Built as a pnpm workspace monorepo with TypeScript.

## Features

- **Shopping** — Product listing, search, filtering, product detail with variants & EMI options
- **Cart & Checkout** — Full cart management, coupon codes, multiple payment methods
- **Orders** — Order placement, tracking with timeline, cancellation
- **Wishlist** — Save products for later
- **Used Goods Marketplace** — C2C listings (like OLX), condition-based, negotiable pricing
- **Reseller Hub** — Share products and earn commission (like Meesho)
- **Seller Dashboard** — Add/manage products, view orders, analytics charts
- **Wallet** — ZenCoins loyalty system, add money, transaction history
- **Chat** — Real-time messaging between buyers and sellers
- **Notifications** — Order updates, deals, system alerts
- **Dark Mode** — Full theme switching via next-themes

## Brand

- Deep Indigo (#1a1a2e) — Primary dark theme
- Electric Teal (#00d4aa) — Accent/CTA
- Warm Amber (#ffb347) — Highlight
- ₹ Indian Rupee currency throughout

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + wouter routing
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- **Build**: esbuild (for API server)
- **Charts**: Recharts (seller analytics)
- **Carousel**: embla-carousel

## Workspace Structure

```
artifacts/
  api-server/     — Express 5 REST API (port 8080, path /api)
  zenkart/        — React + Vite frontend (port 19085, path /)
lib/
  api-spec/       — OpenAPI spec + Orval config
  api-zod/        — Generated Zod schemas + React Query hooks
  api-client-react/ — Re-exported client hooks
  db/             — Drizzle ORM schema + migrations
scripts/
  src/seed.ts     — Initial DB seed (products, categories, banners, listings)
  src/seed-notifications.ts — Seed notifications for buyer user
```

## Database Schema

Tables: users, categories, products, orders, order_items, cart_items, wishlist, reviews, listings, wallet_transactions, notifications, conversations, messages, banners

Enums: user_role (buyer/seller/admin), order_status, payment_method, payment_status, listing_condition, notification_type

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed the database with Indian products/listings/banners
- `pnpm --filter @workspace/scripts run seed-notifications` — seed notifications

## Auth

Simple token scheme: `base64(userId:timestamp:zenkart)` stored in localStorage as `zenkart_token`. Demo users:
- Seller: seller@zenkart.in (user ID 1)
- Buyer: rahul@example.com (user ID 2)
- Unauthenticated requests default to userId=1

## API Routes

All routes mounted at `/api`:
- `GET/POST /auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`
- `GET /products`, `/products/featured`, `/products/flash-sale`, `/products/trending`, `/products/recommendations`, `/products/:id`, `/products/:id/related`
- `GET /categories`
- `GET/POST /cart`, `/cart/items`, `/cart/items/:id`, `/cart/coupon`
- `GET/POST /orders`, `/orders/:id`, `/orders/:id/cancel`
- `GET/POST/DELETE /wishlist`, `/wishlist/:productId`
- `GET/POST /products/:id/reviews`
- `GET/POST/PUT/DELETE /listings`, `/listings/:id`, `/listings/:id/make-offer`
- `GET/POST /reseller/products`, `/reseller/share`, `/reseller/earnings`
- `GET/POST/PUT/DELETE /seller/products`, `/seller/orders`, `/seller/analytics`
- `GET/POST /wallet`, `/wallet/transactions`, `/wallet/add-money`
- `GET/POST /notifications`, `/notifications/:id/read`, `/notifications/read-all`
- `GET/POST /chat/conversations`, `/chat/conversations/:id/messages`, `/chat/start`
- `GET /dashboard/banners`, `/dashboard/summary`

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (desktop only for now: 1024px to 1920px+; no mobile layout work yet)

## Users

- **Shoppers** in India browsing, comparing and buying fashion and accessories (clothing, shoes, bags, jewellery, watches, glasses), paying cash on delivery in INR.
- **Sellers**: small independent shops that list products (up to 5 photos each), keep stock, and move each order item from pending to shipped to delivered.
- **Admins** who run the marketplace: activate or deactivate users and sellers, manage categories, and watch revenue and orders.

## Product Purpose

FlipOne is a real small multi-vendor marketplace. Success means a shopper finds a product, adds it to the cart and checks out without friction, and sellers and admins can run their side quickly. Practical efficiency beats showcase polish.

## Positioning

One marketplace where many small sellers sell side by side; each product shows who sells it, and stock is live (the cart and checkout never oversell).

## Operating Context

- Storefront: home, category browsing, search, product page, cart with shipping choice (flat ₹30 or local pickup) and address, order confirmation, order history with cancellation while pending, profile with picture and password change, liked products.
- Seller portal: dashboard, product list, add/edit product with images, category and subcategories, orders with per-item status.
- Admin portal: dashboard (users, sellers, products, revenue, orders), user and seller management, product catalog, order overview.

## Capabilities and Constraints

- Stack: React 19, Vite 8, Tailwind 4, shadcn/ui (Radix), Lucide, Motion, Apache ECharts (dashboards only), Sonner toasts, Redux Toolkit; Express 5 + MongoDB backend. MUI was removed (user decision, 2026-11-09).
- Currency INR (₹), payment cash on delivery only. No coupons, newsletter, blog or reviews backend.
- Product images come from sellers' uploads (any aspect ratio); category list comes from the admin.
- Analytics come only from the API (admin `/api/admin/analytics/*`, seller `/api/seller/analytics`); never invent figures.
- One low-stock rule everywhere: 5 or fewer left = "ONLY N LEFT".

## Brand Commitments

- Name: **FlipOne** everywhere. The old "MODERNO" theme name is not the brand.
- No fabricated content: no fake address, phone, email, discounts, ratings, reviews or testimonials.

## Evidence on Hand

- Sample product photos in `public/` (clothes, shoes, bags, jewellery, watches, glasses) plus seller uploads served from the API's `/uploads`.
- No real customer reviews, ratings, press or partner logos exist; do not invent them.

## Product Principles

1. Get the shopper to the product and the cart in as few steps as possible.
2. Always show truthful state: stock, price, seller, order status.
3. Seller and admin screens are work tools: dense, scannable, consistent.
4. One FlipOne system across all three areas, not three different apps.

---
version: 1
slug: "src-router-router-jsx"
primary_target: "src/router/Router.jsx"
related_targets: ["src"]
---

Scope: whole FlipOne web app (storefront, seller portal, admin portal), desktop 1024–1920px. Mode: Operate (storefront home leans Persuade only in its first band).

Audience and job: Indian shoppers find a product and check out (COD, INR); small sellers manage products, stock and per-item order status; admins run users, sellers, categories and revenue. Real small marketplace: efficiency first.

Reference: FLIPONE-FRONTEND/DESIGN.md (the system as built, written after the finish review). The approved direction-B mock-up and the layout research notes were deleted by the user on 2026-11-09.

## Direction contract

THESIS: Every product is a garment swing tag Indian shoppers already read: MRP block, category stamp, seller name, stock. Refuses the generic white-card marketplace and the giant empty hero.

OWN-WORLD: Off-white paper #F5F4F0 inside screens, white tag surfaces, ink #17150F, muted #5C584F, kraft #CDAE80 only in bands, tag red #D3261C only for actions and MRP, success #1E7445, warning #A15C00, danger #9E1B32. Barlow Condensed (stamps, labels, MRP numerals, tabular) + Work Sans (body). Statuses are bordered stamp chips (PENDING dashed). Thin 1px ink/neutral rules, small radii (4–6px), crisp, no soft glows.

STORY: The shopper sees products with MRP, seller and stock immediately, filters by seller or price in one row, adds to cart from the card, and checks out on one page. Sellers and admins scan dense tables of stamped statuses and act on one red button.

FIRST VIEWPORT: 64–72px header (wordmark, wide search, Account, Saved, Cart count) + category row; a ≤220px kraft band with "Small shops. One cart." and 7 category tiles; then the filter-chip row and the tag grid with a 2x-size feature tag top-left. Primary action is the red Add to cart on each tag.

FORM: Swing-tag system (B), the user's choice from four previewed directions; seed: none (unavailable: this CLI version emitted no seed reference). The user chose B (grounded pick) over the assigned A after comparing four built mock-ups.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

Stack decision (user-approved): shadcn/ui + Tailwind 4 (Radix), Lucide icons, Motion for micro-interactions, selected Magic UI pieces restyled to the palette; remove MUI, Emotion, react-icons, react-toastify (use sonner).

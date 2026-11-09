# FlipOne shared components (swing-tag system)

Design system: `DESIGN.md` (direction B, swing tag). Contract:
`.impeccable/surfaces/src-router-router-jsx.md`. Layout rules: `DESIGN.md`. Copy rules:
`PRODUCT.md` (brand "FlipOne"; no ratings, discounts, delivery promises or invented contact details).

Everything here is JSX. Import from the barrel or from the file:

```jsx
import { TagCard, Mrp, Stamp, StoreLayout } from "@/components/flipone";
import TagCard from "@/components/flipone/TagCard";
```

`@` resolves to `src/` (vite.config.js `resolve.alias` + jsconfig.json).

---

## 0. Foundation you get for free

| Piece | Where | Notes |
| --- | --- | --- |
| Theme tokens | `src/index.css` | Tailwind 4 `@theme inline` + shadcn variables mapped onto the palette. Light only (`dark:` only applies under a `.dark` class, which is never set). |
| Fonts | `src/main.jsx` | `@fontsource/work-sans` 400-700 (body, `font-sans`), `@fontsource/barlow-condensed` 500-700 (`font-display`). No Google Fonts link. |
| Motion | `src/main.jsx` | `<MotionConfig reducedMotion="user">` wraps the app; `index.css` also collapses CSS animations/transitions under `prefers-reduced-motion: reduce`. Import from `"motion/react"`. |
| Tooltips | `src/main.jsx` | One `<TooltipProvider>` (300ms delay) is mounted; use `<Tooltip>` anywhere. |
| Toasts | `src/lib/toast.js` | `import { toast } from "@/lib/toast"` (sonner). `<Toaster />` is mounted in main.jsx. |
| Formatting | `src/lib/format.js` | `formatInr(1299)` "₹1,299", `formatInr(3842600)` "₹38,42,600", `formatNumber`, `formatDate` ("9 Nov 2026"), `shortId(id)` ("#6F3A21"), `capitalize`. |
| `cn()` | `src/lib/utils.js` | clsx + tailwind-merge. |
| Focus | global | Every `:focus-visible` gets a 2px ink outline, offset 2px. Do not add `outline-none` without a replacement. |

### Palette utilities (Tailwind classes)

| Token | Hex | Classes | Use |
| --- | --- | --- | --- |
| paper | #F5F4F0 | `bg-paper` | app ground (body default) |
| paper-2 | #ECEAE4 | `bg-paper-2` | hover fills, image wells, disabled |
| surface | #FFFFFF | `bg-surface` | tags, panels, tables, inputs |
| ink | #17150F | `text-ink bg-ink border-ink` | text, control borders, portal sidebar |
| ink-2 | #3B372F | `text-ink-2` | secondary ink (labels) |
| ink-hover | #38342B | `bg-ink-hover` | hover for ink fills |
| muted text | #5C584F | `text-muted-foreground` | secondary text (7.1:1 on white). Note `bg-muted` is paper-2, shadcn convention. |
| line | #8A857B | `border-line` / `border-input` | input/control borders, 3.7:1 on white |
| line-mid | #C4C2BC | `border-line-mid` | dashed tag tear line, MRP box, chips, popovers |
| line-soft | #DEDCD6 | `border-line-soft` (= default `border`) | card borders, table rules |
| kraft | #CDAE80 | `bg-kraft`, `text-kraft-ink` (#4A3B22) | bands only (CategoryBand, sell tile) |
| red | #D3261C | `bg-primary`/`bg-red`, `text-red`, `bg-primary-hover` (#B01E15), `bg-red-tint` | the action, MRP figures, cart count. White on red 5.2:1 |
| success | #1E7445 | `text-success bg-success-tint` | delivered, active |
| warning | #A15C00 | `text-warning bg-warning-tint` | pending, only N left |
| danger | #9E1B32 | `text-danger bg-danger-tint` (= `destructive`) | cancelled, errors, remove |
| table | — | `bg-head` (#FAF9F6), `bg-row-hover` (#FAF8F3) | table header / row hover |

Extra utilities: `tabular` (tabular lining figures for prices, counts, ids, dates), `label-caps`
(Barlow Condensed 600 caps, +0.1em: field labels like the mock-up's `.field-label`), `focus-ring`,
`shadow-tag` (the only card shadow: blur 12px max), `ease-(--ease-out-quint)`.
Radii: `rounded-sm` 4px (stamps), `rounded-md`/`rounded-lg` 6px (controls, tags, panels).
Type scale used in the mock-up: page title 26-28px/600/-0.02em, section 19px/600, body 15px, small 13-14px,
nothing functional under 12px.

### shadcn/ui primitives (`src/components/ui/*`, restyled)

`button, input, label, textarea, select, checkbox, radio-group, switch, dialog, sheet, dropdown-menu, tabs,
table, badge, separator, skeleton, tooltip, avatar, popover, slider, sonner`.

- **Button** variants: `primary` (default, tag red), `ink`, `outline` (ink border on white), `secondary`,
  `ghost`, `destructive`, `remove` (muted, danger on hover: cart "Remove"), `link`. Sizes: `default` 44px,
  `sm` 34px, `lg` 52px, `xs` 28px, `icon` 44, `icon-sm` 34, `icon-lg` 52, `icon-xs` 28. A plain Button
  defaults to `type="button"`; pass `type="submit"` in forms. Use `asChild` for links:
  `<Button asChild><Link to="/addtocart">Go to cart</Link></Button>`. One red button per view.
- **Input / Textarea**: 44px, 1.5px control border, `aria-invalid` paints danger. `fieldClasses` is exported
  from input.jsx for custom controls.
- **Select**: trigger matches Input (`size="sm"` = 34px sort select). Prefer `position="popper"` on content.
- **Tabs**: `<TabsList>` default/`variant="pill"` = mock-up `.tab` (active filled ink); `variant="line"` =
  underlined text tabs.
- **Table**: Barlow caps headers on `bg-head`, 44px rows. Use DataTable below for the panel + sticky header.
- **Badge**: `variant="count"` for counts; statuses use `<Stamp>`, not Badge.
- **Separator** `variant="dashed"` = the tag's dashed tear line.
- **Checkbox** checked = ink; **RadioGroupItem** checked = red dot; **Switch** on = success.
- Dialog/Sheet overlays are flat `bg-ink/55` (no blur).

---

## 1. Logo, LogoMark — `@/components/flipone/Logo`

Mock-up: `.wordmark` (header and portal sidebar). Favicon: `public/favicon.svg` (same mark as `LogoMark`).

| Prop | Default | |
| --- | --- | --- |
| size | `'md'` | `'sm'` 24px, `'md'` 30px, `'lg'` 40px |
| tone | `'ink'` | `'paper'` on the ink sidebar |
| compact | `false` | renders the square `LogoMark` only |
| to | `"/"` | link target; `null` renders a static mark |

```jsx
<Logo />                       // home link
<Logo tone="paper" compact />  // collapsed portal rail
<LogoMark className="size-10" title="FlipOne" />
```

## 2. Mrp — `@/components/flipone/Mrp`

Mock-up: `.mrp` / `.mrp-lg` (tags, product page). Prints `MRP ₹1,299 (incl. of all taxes)` with en-IN grouping.

| Prop | Default | |
| --- | --- | --- |
| value | — | rupees (number or numeric string) |
| size | `'md'` | `'sm'` (20px figure: "more from seller" grid), `'md'` (24px: grid tag), `'lg'` (40px: feature tag, buy box) |
| showNote | `true` | hide "(incl. of all taxes)" |
| label | `"MRP"` | |

```jsx
<Mrp value={product.price} size="lg" />
```

For plain amounts (cart lines, totals, tables) use `formatInr()` with `className="tabular"`; for the big
summary total follow the mock-up `.sum-total .v` (Barlow 600 40px, `text-red`).

## 3. Stamp — `@/components/flipone/Stamp`

Mock-up: `.stamp` kit (direction header, tables, tags). Barlow Condensed caps, bordered.

| Prop | |
| --- | --- |
| variant | `pending` (dashed warning), `shipped` (ink), `delivered` (success, check icon), `cancelled` (danger), `lowStock` ("ONLY N LEFT"), `outOfStock` (dashed muted), `category` (thin outline, "MEN · SHIRTS"), `neutral`, `kraft` (on ink), `sample` (dashed) |
| status | backend status string (`pending`/`shipped`/`delivered`/`cancelled`): picks the variant and the label |
| count | for `lowStock` |
| size | `'md'` (24px) or `'lg'` (36px) |

```jsx
<Stamp status={item.status} />
<Stamp variant="lowStock" count={product.stock} />
<Stamp variant="category">Women · Dresses</Stamp>
```

## 4. TagCard — `@/components/flipone/TagCard`

Mock-up: `.tc` (grid tag) and `.tc.feature` (2x2 feature tag), home and listing grids.

| Prop | Default | |
| --- | --- | --- |
| product | — | backend shape `{ _id, name, price, stock, images[], category: {name} or string, subcategories[], seller: {name} }` |
| size | `'md'` | `'feature'` spans 2 columns x 2 rows (`col-span-2 row-span-2`): put it first in a grid with `grid-flow-dense` |
| onAdd | — | `(product) => void`. md: an ink "Add" bar revealed on hover/keyboard focus; feature: red "Add to cart" button. Hidden when `stock <= 0`. Wire it to `useAddToCart()` from `src/hooks/useAddToCart.js`. |
| onToggleLike, liked | — | wishlist heart (top-right of the image, Motion pop). Hidden without `onToggleLike`. |
| lowStockAt | `5` | stock at or below shows the ONLY N LEFT stamp |

Image: `imageUrl(product.images)` (3:4, `object-cover`; feature fills its column height). The image link is
`aria-hidden`/`tabIndex=-1`; the name link is the tab stop and the whole tag draws the focus ring.

```jsx
const addToCart = useAddToCart();
<ul className="grid grid-flow-dense grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 min-[1800px]:gap-5">
  <li className="col-span-2 row-span-2 grid"><TagCard product={first} size="feature" onAdd={addToCart} /></li>
  {rest.map((p) => (
    <li key={p._id} className="grid"><TagCard product={p} onAdd={addToCart} /></li>
  ))}
</ul>
```
(If the TagCard sits inside an `<li>`, put the span classes on the `<li>`; RESEARCH.md: 4 columns at 1280,
5 at 1440, 6 at 1920, gap 16-24px.)

## 5. StoreHeader — `@/components/flipone/StoreHeader`

Mock-up: `.sh` (storefront header + category row). Replaces `src/user/pages/navbar/Navbar.jsx` (MUI).
Keeps the old behaviour: cart count = sum of `requestedQuantity` in `state.cart.items`; guests see "Log in";
signed-in shoppers get an Account menu (Profile `/updateprofile`, My orders `/order-history`, Log out ->
`dispatch(logout())` + `/login`).

| Prop | Default | |
| --- | --- | --- |
| onSearch | — | `(q) => void`; default navigates to `/categories?q=<q>` |
| categories | fetched | names or `{name}`; default `GET /api/product/categories`. Links go to `/categories?category=<name>` (active one is underlined via `aria-current`). |
| savedTo | `"/saved"` | "Saved" link. **There is no `/saved` route yet**: the page agent that builds liked products (`GET /api/user/likes`, `POST /api/user/is-liked/:productId`) should add it, or pass `savedTo={null}` to hide the link. |
| showCategories | `true` | |
| sticky | `false` | pin to top |

Search results page contract: the Categories page should read `?q=` (call `GET /api/product/search?q=`, the
old navbar's endpoint) and `?category=`.

## 6. StoreFooter — `@/components/flipone/StoreFooter`

Real links only: Shop `/`, Women, Men (`/categories?category=...`), Sell on FlipOne `/selar_registrastion`,
Contact `/contact`; COD note; "© year FlipOne". No props besides `className`.

## 7. StoreLayout — `@/components/flipone/StoreLayout`

Frame for every storefront page: skip link, StoreHeader, `<main id="main">`, StoreFooter on paper.

| Prop | Default | |
| --- | --- | --- |
| contained | `true` | wraps children in `<Container className="py-5">`; pass `false` for pages with full-bleed bands |
| headerProps | — | forwarded to StoreHeader |
| mainClassName | — | |

```jsx
<StoreLayout contained={false}>
  <CategoryBand categories={categories} />
  <Container className="pt-3.5 pb-8">…grid…</Container>
</StoreLayout>
```

## 8. Container — `@/components/flipone/Container`

Max content 1600px, centred, 24px gutters (28px from 1280px). `as` prop for the element. Use it inside
full-bleed sections so content lines up with the header.

## 9. CategoryBand — `@/components/flipone/CategoryBand`

Mock-up: `.band` + `.cat` tiles (home, under the header; at most ~220px tall). Full-bleed kraft.

| Prop | Default | |
| --- | --- | --- |
| categories | `[]` | names or `{ name, image?, imagePosition? }`; usual names (women, men, bags, footwear, shoes, watches, eyewear, glasses, jewellery, dresses, shirts) get a sample photo from `public/`, others a label-only tile |
| title | "Small shops. One cart." | |
| description | "Every tag shows the seller, the MRP and how many are left." | |
| headingLevel | `'h1'` | |
| max | `7` | |

Tiles link to `/categories?category=<name>`. Stacks title above tiles below 1280px.

## 10. PortalShell — `@/components/flipone/PortalShell`

Mock-up: `.app` / `.side` / `.main` / `.topbar` (admin dashboard, seller orders). Replaces
`Selar_Sidebar`/`Selar_Navbar` and `Admin_Sidebar`/`Admin_Navbar`.

Ink sidebar 240px (68px icon rail with tooltips below 1280px): wordmark, role stamp + account name, nav
(active item: paper-tinted fill + semibold white text + `aria-current="page"`; no red marker, no coloured
side bar), avatar + Log out at the bottom. Content column max 1600px.

| Prop | Default | |
| --- | --- | --- |
| variant | `'seller'` | `'seller'` or `'admin'`: default nav, role stamp, name from redux (`seller.sellerInfo.name` / `admin.adminInfo.name`), logout target |
| title | — | page h1 in the top bar |
| titleAddon | — | node after the title (e.g. a Stamp) |
| subtitle | — | muted line under the title |
| actions | — | right side of the top bar (search, filter, primary button) |
| nav | role default | `[{ to, label, icon, end?, also? }]` (`also`: extra path prefixes that mark it active) |
| onLogout | default | default dispatches `logoutSeller()`/`logoutAdmin()` and goes to `/selar_login` / `/admin_login` |
| roleNote | account name | text beside the role stamp |
| contentClassName | — | |

Default nav (`SELLER_NAV`, `ADMIN_NAV` in `portalNav.js`): seller Dashboard `/selar_dashboard`, Products
`/selar_Products` (+`/updateproduct`), Orders `/orders`; admin Dashboard `/admin`, Users `/user_manage`
(+`/admin/allUsers`), Sellers `/seller_manage`, Products `/product_catlog`, Orders `/order_manage`,
Profile `/admin_profile`.

```jsx
<PortalShell
  variant="admin"
  title="Dashboard"
  actions={<Button variant="outline" size="sm"><Download />Export CSV</Button>}
>
  <StatStrip>…</StatStrip>
  <DataTable>…</DataTable>
</PortalShell>
```

## 11. StatStrip / StatTile / NumberTicker — `@/components/flipone/StatStrip`, `NumberTicker`

Mock-up: `.stats` / `.stat` (admin dashboard). Auto-fit tiles (min 150px) divided by 1px rules, figures in
Barlow Condensed ink (34px, 28px below 1280px). Keep to 4-5 tiles. Seller dashboard: no analytics endpoint,
so show only counts you can compute from real data; never invent figures.

StatTile props: `label`, `icon` (lucide component), `value`, `note`, `format` (`'number'` | `'inr'` | fn),
`animate` (count up once in view via NumberTicker; instant under reduced motion), `loading` (skeleton).

```jsx
<StatStrip>
  <StatTile label="Total users" icon={Users} value={stats.users} animate />
  <StatTile label="Revenue" icon={Banknote} value={stats.revenue} format="inr" animate />
</StatStrip>
```

`<NumberTicker value={1284} format={formatNumber} />` can be used alone (Magic UI-style, built on Motion
`animate` + `useInView`; screen readers get the final value).

## 12. DataTable helpers — `@/components/flipone/DataTable`

Mock-up: `.panel` + `.tabs` + `table` + `.tbl-foot` (admin orders, seller order items).

- `DataTable` props: `toolbar`, `footer`, `maxHeight` (scroll box height, default `"70vh"`, `"none"` lets
  the page scroll, which also turns the sticky header off), `label`, `tableClassName`. Children are
  `TableHeader`/`TableBody` from `@/components/ui/table`. The header row sticks inside the scroll box;
  the box scrolls horizontally instead of the page.
- `DataTableToolbar`: filter tab row (use `Button variant="ghost" size="sm"` with `aria-pressed`, or shadcn
  Tabs); put right-side actions in `<div className="ml-auto">`.
- `DataTableFooter`: "Showing 1-10 of 938" + pager.
- `CellText` (`max` CSS width, default `"18ch"`; ellipsis + title), `CellSub` (muted 12.5px second line).
- `DataTableMessage colSpan={n}`: one full-width row for loading / empty / error (put an `EmptyState
  variant="plain"` inside).

```jsx
<DataTable
  label="Recent orders"
  toolbar={<DataTableToolbar>…filters…<div className="ml-auto">…</div></DataTableToolbar>}
  footer={<DataTableFooter><span className="tabular">Showing 1–10 of {total}</span>…</DataTableFooter>}
>
  <TableHeader><TableRow><TableHead>Order</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
  <TableBody>
    {orders.map((o) => (
      <TableRow key={o._id}>
        <TableCell className="font-display font-semibold tracking-[0.06em]">{shortId(o._id)}</TableCell>
        <TableCell className="text-right font-semibold tabular">{formatInr(o.totalAmount)}</TableCell>
        <TableCell><Stamp status={o.status} /></TableCell>
      </TableRow>
    ))}
  </TableBody>
</DataTable>
```

## 13. PageHeader — `@/components/flipone/PageHeader`

Mock-up: `.co h1` (cart "Cart  2 items") and `.filters h2` (grid section head).
Props: `title`, `count`, `subtitle`, `actions`, `as` (default `'h1'`), `size` (`'lg'` 28px | `'md'` 19px),
`children` (extra inline content, e.g. filter chips).

```jsx
<PageHeader title="Your cart" count={`${items.length} items`} />
<PageHeader as="h2" size="md" title="New on FlipOne" count={`${products.length} products`} />
```

## 14. EmptyState + illustrations — `@/components/flipone/EmptyState`, `./illustrations`

Props: `illustration` (`'bag'` | `'orders'` | `'results'` | `'products'` | element | `null`), `title`, `body`,
`action`, `variant` (`'panel'` white framed | `'plain'`), `headingLevel` (default `'h2'`).
Illustrations (160x120 ink line art, one kraft or red accent, authored for FlipOne): `EmptyBag` (empty cart
/ saved), `NoOrders` (receipt with empty red stamp), `NoResults` (tag under a magnifier), `NoProducts`
(open box with a blank tag). Decorative by default; pass `title` to expose as an image.

```jsx
<EmptyState
  illustration="bag"
  title="Your cart is empty"
  body="Add something from the shop and it will wait here."
  action={<Button asChild><Link to="/">Browse the shop</Link></Button>}
/>
```

## 15. Form fields (Formik + shadcn) — `@/components/flipone/FormField`

Mock-up: `.fld` (checkout address). Label 13.5px/600 above a 44px control; error in danger with an alert
icon; `aria-invalid` and `aria-describedby` wired to the error/hint.

- `FormField` (inside `<Formik>`): `name`, `label`, `hint`, `required`, `as` (`'input'` | `'textarea'`), any
  other prop goes to the control (`type`, `placeholder`, `autoComplete`, `inputMode`...). Error shows once
  touched. Not for `type="file"`: use `FieldShell` with your own handler.
- `FormSelectField`: `name`, `label`, `options` (strings or `{value,label}`), `placeholder`,
  `onValueChange` (runs after Formik updates; e.g. reset subcategory), `disabled`.
- `FieldShell`: same layout for any control; children is a function receiving
  `{ id, "aria-invalid", "aria-describedby", "aria-required" }`.
- `FieldError`, `FieldHint`: the lines on their own.

```jsx
<Formik initialValues={{ name: "", city: "" }} validationSchema={schema} onSubmit={save}>
  <Form className="grid grid-cols-3 gap-x-4 gap-y-3.5">
    <FormField name="name" label="Full name" autoComplete="name" className="col-span-full" />
    <FormSelectField name="category" label="Category" options={categories.map((c) => c.name)} />
    <Button type="submit">Save</Button>
  </Form>
</Formik>
```

## 16. SkipLink — `@/components/flipone/SkipLink`

"Skip to content" (targets `#main`). Already included by StoreLayout and PortalShell.

## 17. StatusMeterList — `@/components/flipone/StatusMeterList`

Mock-up: admin dashboard "Orders by status" (`.panel` + `.st-list`). Replaces the ECharts `statusDonut` on
every page. One row per status: the real `Stamp` (dashed PENDING, ink SHIPPED, ✓ DELIVERED, CANCELLED), a
1px meter (light track, fill in the status's own colour: warning / ink / success / danger `#9E1B32`, never tag
red), the count in Barlow Condensed tabular figures and its share in muted text. The total line states its
qualifier: `35 orders · incl. 1 cancelled` (the cancelled clause appears whenever cancelled > 0).

| Prop | Default | |
| --- | --- | --- |
| counts | — | `{ pending, shipped, delivered, cancelled }` (e.g. `/analytics/order-status` `.orders` / `.items`, seller `statusCounts`); missing or invalid values count as 0 |
| unit | `'orders'` | `'orders'` or `'items'` (singular for 1: "1 item") |
| title | — | heading in the panel head (left), total line on the right; without it the list is labelled "Orders by status" / "Items by status" |
| headingLevel | `'h2'` | |
| totalLabel | generated | replaces the whole total line |
| qualifier | — | appended to the total line: `35 orders · incl. 1 cancelled · last 30 days` |
| caption | — | muted footnote under the list (e.g. "Per order item: an order with 3 items counts 3 times.") |
| onSelect | — | `(status) => void`; each row becomes a toggle button (44px) to filter a table |
| selected | — | status shown as pressed (`aria-pressed`, paper-2 fill) |
| loading | `false` | skeleton total and counts, `aria-busy` |
| variant | `'panel'` | `'panel'` (white, 1px rule, 6px radius) or `'plain'` (inside an existing panel) |

Accessibility: a `<section>` named by the title, a `<ul>` with one `<li>` per status; each row's readable
text is one sentence ("Pending: 42 orders, 4% of 938"), the visual stamp/meter/figures are `aria-hidden`.
Shares under 0.5% read `<1%`, never a false `0%`.

```jsx
<StatusMeterList title="Orders by status" counts={status?.orders} unit="orders" qualifier="all time" />
<StatusMeterList
  title="Items by status"
  counts={analytics?.statusCounts}
  unit="items"
  caption="Each order item counts once."
  selected={filter}
  onSelect={(s) => setFilter((cur) => (cur === s ? null : s))}
/>
```

---

## Rules for page agents

- Paper ground, white tags/panels, 1px rules; no gradients, glass, glow, soft wide shadows (blur <= 12px),
  nested cards or emoji icons. Icons: `lucide-react`, stroke 1.75, 16-20px.
- Red is for the one main action per view, MRP figures and the cart count. Never a chart series, decorative
  dot, marker or active-nav indicator. Kraft only in bands.
- No side-tab accents (a thick coloured border on one side of a card, row or nav item).
- One low-stock rule: 5 or fewer left = "ONLY N LEFT" (`/api/seller/analytics` returns `lowStockThreshold: 5`).
- Every figure states its qualifier when it differs from the plain reading ("incl. 1 cancelled", "last 30 days").
- Statuses are `Stamp`s. Prices are `Mrp` (product) or `formatInr` + `tabular` (everything else).
- Every interactive element needs a visible hover and the 2px focus ring (global). Text >= 12px, AA contrast:
  use `text-muted-foreground`, never lighter greys.
- Layout 1024-1920px: `Container` for width, no horizontal page scroll (tables scroll inside DataTable).
- Motion: CSS transitions 150-200ms with `ease-(--ease-out-quint)`, or Motion from `"motion/react"`
  (already reduced-motion aware). One authored moment per view; no entrance animations on every section.
- Tailwind note: on machines where Windows blocks Tailwind's native scanner binary, `vite.tailwind-sources.js`
  feeds class names from `src/` to Tailwind (a warning prints at startup). Write class names as complete
  literal strings (no `bg-${color}` string building) so they are found either way.

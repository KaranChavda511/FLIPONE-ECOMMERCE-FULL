---
name: FlipOne
description: A small multi-vendor marketplace where every product is a printed garment swing tag.
colors:
  tag-red: "#D3261C"
  tag-red-hover: "#B01E15"
  tag-red-tint: "#FCECEA"
  kraft: "#CDAE80"
  kraft-deep: "#B8955F"
  kraft-mark: "#A8875A"
  kraft-ink: "#4A3B22"
  ink: "#17150F"
  ink-2: "#3B372F"
  ink-hover: "#38342B"
  muted: "#5C584F"
  line: "#8A857B"
  line-mid: "#C4C2BC"
  line-soft: "#DEDCD6"
  chart-grid: "#E6E3DC"
  paper: "#F5F4F0"
  paper-2: "#ECEAE4"
  surface: "#FFFFFF"
  table-head: "#FAF9F6"
  row-hover: "#FAF8F3"
  success: "#1E7445"
  success-tint: "#EAF4EE"
  warning: "#A15C00"
  warning-tint: "#FBF1E2"
  danger: "#9E1B32"
  danger-tint: "#FAECEF"
typography:
  display:
    fontFamily: "Barlow Condensed, Work Sans, ui-sans-serif, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.005em"
  numeral-lg:
    fontFamily: "Barlow Condensed, Work Sans, ui-sans-serif, sans-serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.01em"
    fontFeature: "tnum, lnum"
  numeral:
    fontFamily: "Barlow Condensed, Work Sans, ui-sans-serif, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.005em"
    fontFeature: "tnum, lnum"
  headline:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    lineHeight: 1.3
  title-sm:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Work Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "Barlow Condensed, Work Sans, ui-sans-serif, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.1em"
  stamp:
    fontFamily: "Barlow Condensed, Work Sans, ui-sans-serif, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.08em"
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  full: "9999px"
spacing:
  gap-sm: "8px"
  gap: "16px"
  panel: "18px"
  gutter: "24px"
  gutter-xl: "28px"
  control: "44px"
  control-sm: "34px"
components:
  button-primary:
    backgroundColor: "{colors.tag-red}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.tag-red-hover}"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "44px"
  button-ink-hover:
    backgroundColor: "{colors.ink-hover}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.paper-2}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "34px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  stamp-pending:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.warning}"
    typography: "{typography.stamp}"
    rounded: "{rounded.sm}"
    height: "24px"
  stamp-shipped:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.stamp}"
    rounded: "{rounded.sm}"
    height: "24px"
  stamp-delivered:
    backgroundColor: "{colors.success-tint}"
    textColor: "{colors.success}"
    typography: "{typography.stamp}"
    rounded: "{rounded.sm}"
    height: "24px"
  stamp-cancelled:
    backgroundColor: "{colors.danger-tint}"
    textColor: "{colors.danger}"
    typography: "{typography.stamp}"
    rounded: "{rounded.sm}"
    height: "24px"
  stamp-low-stock:
    backgroundColor: "{colors.warning-tint}"
    textColor: "{colors.warning}"
    typography: "{typography.stamp}"
    rounded: "{rounded.sm}"
    height: "24px"
  mrp-block:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tag-red}"
    typography: "{typography.numeral-lg}"
    rounded: "{rounded.sm}"
    padding: "7px 12px 6px"
  tag-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "11px 12px 12px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
  portal-sidebar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    width: "240px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "12px 14px 12px 16px"
    width: "440px"
---

# Design System: FlipOne

## Overview

**Creative North Star: "The Swing Tag"**

Every product in FlipOne is printed like the garment tag an Indian shopper already reads in a shop: a white card hung on a paper ground, a dashed tear line, a boxed MRP in red condensed numerals with "(incl. of all taxes)" underneath, a thin category stamp, the seller's name and a stock line. The rest of the system is cut from the same stationery. Statuses are rubber stamps, the category band is kraft paper, and the seller and admin portals are the shop's ledger: an ink sidebar, white panels, 1px rules and tabular figures.

The system is dense and practical, built for work. Storefront grids pack 5 tags across at 1440px with a 2x2 feature tag first. Portal screens are tables of stamped rows with one red action. Surfaces are flat white on warm off-white paper. Depth comes from 1px rules and a single tight tag shadow that appears on hover, never from soft glows. Colour is spent sparingly: ink carries most of the information, tag red marks the one thing to do and what it costs, and kraft appears only as a band.

The build refuses the generic white-card marketplace (blue accents, rounded pill cards, star ratings, discount badges) and the giant empty hero. The first viewport is header, a kraft band of at most about 220px, then products.

**Key Characteristics:**
- Paper ground (#F5F4F0), white tag and panel surfaces, warm near-black ink.
- Two type voices: Work Sans for reading, Barlow Condensed caps for stamps, labels, MRP and every big figure.
- Tag red is reserved: actions, MRP figures, the cart count. Nothing else.
- Status is always a bordered stamp chip; PENDING is dashed.
- Small, crisp radii (4px stamps, 6px controls and tags), 1px rules, blur never above 12px.
- Desktop only, 1024 to 1920px, content capped near 1600px.

## Colors

A warm stationery palette: paper, ink and kraft neutrals, with one printed red and three status inks.

### Primary
- **Tag Red** (tag-red): the price-tag red. Primary buttons (the one main action per view), the MRP figure, the cart count, the wishlist heart when saved, the text caret. White text on it holds 5.2:1. Hover deepens to **Pressed Red** (tag-red-hover); **Red Blush** (tag-red-tint) is the faint wash for red-adjacent states.

### Secondary
- **Kraft** (kraft): brown paper. Used only as full-bleed bands (the home category band, the "Sell on FlipOne" band), the text selection colour, the portal role stamp and avatar on the ink sidebar. Text on kraft uses **Kraft Ink** (kraft-ink, 5.1:1).
- **Kraft Mark** (kraft-mark): the darker kraft for chart marks on white (3.3:1); plain kraft is too light for marks.

### Tertiary (status inks)
- **Ledger Green** (success): DELIVERED, active, the "on" switch. Tint: success-tint.
- **Amber Ink** (warning): PENDING, ONLY N LEFT. Tint: warning-tint.
- **Oxblood** (danger): CANCELLED, errors, remove, invalid fields. Tint: danger-tint. Oxblood is not tag red and never stands in for it.

### Neutral
- **Shop Ink** (ink): body text, control borders, outline buttons, the portal sidebar, checked checkboxes, the focus ring, the first chart series.
- **Soft Ink** (ink-2): MRP label, secondary labels. **Ink Hover** (ink-hover): hover fill for ink surfaces.
- **Muted Ink** (muted): secondary text, placeholders, table headers (7.1:1 on white). Never go lighter for text.
- **Control Line** (line): input and control borders (3.7:1 on white) and the second chart series.
- **Tear Line** (line-mid): dashed tag tear line, MRP box, category stamp outline, popovers.
- **Rule** (line-soft): card and panel borders, table rules, stat dividers, meter tracks.
- **Paper** (paper): the app ground. **Paper Fold** (paper-2): hover fills, image wells, disabled controls, secondary buttons.
- **Tag White** (surface): tags, panels, tables, inputs.
- **Ledger Head** (table-head) and **Row Warmth** (row-hover): table header band and row hover.

### Named Rules
**The Price-Tag Red Rule.** Tag red marks actions (primary buttons, the cart count) and MRP prices only. It is never a chart series, marker, dot, active-nav indicator, status or decoration. Cancelled is oxblood, not red. One red button per view.

**The Kraft Band Rule.** Kraft is a band, never a tint for cards, buttons or text backgrounds inside white surfaces.

**The Chart Ink Order Rule.** Chart series run ink, Control Line grey, Kraft Mark, Ledger Green, Amber Ink, Muted Ink, in that order. Gridlines are chart-grid; axes are Control Line.

## Typography

**Display Font:** Barlow Condensed (with Work Sans, ui-sans-serif)
**Body Font:** Work Sans (with ui-sans-serif, system-ui)

**Character:** Work Sans is the plain, legible shop voice for names, prose and controls. Barlow Condensed is the printed voice of the tag: the stamp, the MRP, the ledger figure and the band heading, always set tight and usually in tracked caps.

### Hierarchy
- **Display** (Barlow Condensed 700, 30px, line-height 1): the kraft band heading ("Small shops. One cart."). Not for page titles.
- **Numeral Large** (Barlow Condensed 600, 40px, tabular, tag red): the feature-tag and product-page MRP, the cart summary total. Grid tags use 24px, "more from this seller" uses 20px.
- **Numeral** (Barlow Condensed 600, 34px, 28px below 1280px, tabular, ink): stat tiles and chart headline figures. Status counts use 18px.
- **Headline** (Work Sans 600, 26 to 28px, -0.02em): page titles in the portal top bar and storefront pages.
- **Title** (Work Sans 600, 19px): section heads ("New on FlipOne"). Panel heads use 15px; feature tag names 22px; grid tag names 14.5px, clamped to 2 lines.
- **Body** (Work Sans 400, 15px, 1.5): default text and controls. Small text 13 to 14px; tag meta 12.5px.
- **Label** (Barlow Condensed 600, 12.5px, +0.1em, uppercase): table headers and definition-list labels (Order, Placed, Total, Seller, Stock).
- **Stamp** (Barlow Condensed 600, 13px, +0.08em, uppercase): status and category stamps; large stamps 17px.

### Named Rules
**The Tabular Figures Rule.** Every price, count, date and id uses tabular lining figures. Product prices are the MRP block; every other amount is plain ₹ with Indian grouping (₹38,42,600) in tabular figures.

**The 12px Floor Rule.** Nothing functional is set under 12px.

## Layout

Desktop only, 1024 to 1920px. Content is centred with a 1600px maximum and 24px gutters (28px from 1280px); full-bleed bands (kraft) run edge to edge with their content aligned to the same container. The page never scrolls horizontally; wide tables scroll inside their panel.

Storefront: a 64 to 72px header (wordmark, wide search, Account, Saved, Cart), a category row, the kraft band, a single filter-chip row, then the tag grid: auto-fill columns of at least 200px with 16px gaps (20px from 1800px), about 4 columns at 1280, 5 at 1440, 6 at 1920, and the 2x2 feature tag first with dense packing.

Portals: an ink sidebar, sticky at full viewport height, 240px wide from 1280px and a 68px icon rail with tooltips below. The content column holds the title bar (title, optional stamp, right-aligned actions) and 18px-spaced stacks of panels: stat strip, tables, status meters, charts.

Rhythm: 44px is the control and row height (34px for small controls), panels pad 14 to 18px, grids gap 16px. Prefer layouts that settle at one breakpoint; on this toolchain's scanner fallback, responsive grid overrides (an lg column count replaced at xl) can apply in the wrong order.

## Elevation & Depth

Flat by default. Depth is drawn with 1px rules and the paper/white contrast, not shadows. A tag lifts 2px and takes the tag shadow only on hover or keyboard focus. Floating layers (popovers, menus, toasts) take the large tight shadow. Dialog and sheet overlays are a flat 55% ink scrim with no blur.

### Shadow Vocabulary
- **Tag lift** (`box-shadow: 0 1px 2px rgb(23 21 15 / 0.06), 0 4px 12px -4px rgb(23 21 15 / 0.16)`): tag and category tile hover/focus.
- **Float** (`box-shadow: 0 2px 4px rgb(23 21 15 / 0.08), 0 8px 12px -6px rgb(23 21 15 / 0.22)`): popovers, menus, dropdowns.
- **Hairline** (`box-shadow: 0 1px 3px rgb(23 21 15 / 0.18)`): the white wishlist disc over product photos.

### Named Rules
**The 12px Blur Ceiling Rule.** No shadow blur exceeds 12px. No glows, gradients, glass or backdrop blur anywhere, including chart marks and areas (areas are a solid 8% fill).

## Shapes

Small, crisp corners: 4px for stamps, the MRP box and extra-small buttons; 6px for buttons, inputs, tags, panels, toasts and nav items. Only the wishlist disc and avatars are round. Borders do the work: 1px rules for surfaces, 1.5px for controls and stamps (2px on large stamps), and dashed lines carry meaning: the tag's tear line between photo and print, the PENDING and OUT OF STOCK stamps. Product photos sit in 3:4 wells (the feature tag fills its column height); category tiles crop 2:1.

## Components

### Buttons
Firm, printed, one red per view.
- **Shape:** gently squared (6px), 1.5px border, Work Sans 600; heights 44px default, 34px small, 52px large, 28px extra-small (4px corners).
- **Primary:** tag red with white text, 18px side padding. Hover goes to Pressed Red.
- **Ink:** ink fill, paper text: the strong secondary and the tag's quick "Add" bar.
- **Outline:** white with an ink border; hover fills Paper Fold.
- **Secondary / Ghost:** Paper Fold fill, or transparent with a Paper Fold hover; ghost is the filter-tab and toolbar button.
- **Remove:** muted text that turns oxblood on an oxblood-tint hover.
- **Link:** ink text with a 1.5px Tear Line underline that turns ink on hover.
- **States:** 150ms ease-out-quint colour transitions, 0.98 press scale, the shared 2px ink focus ring at 2px offset; disabled is Paper Fold with muted text.

### Stamps (signature)
The system's state language: bordered Barlow Condensed caps chips, 24px tall (36px large), 4px corners, 1.5px border in the text colour.
- **PENDING:** dashed amber on white. **SHIPPED:** ink on white. **DELIVERED:** green on green tint with a check icon. **CANCELLED:** oxblood on oxblood tint.
- **ONLY N LEFT:** amber on amber tint, shown at 5 or fewer in stock. **OUT OF STOCK:** dashed muted on white.
- **Category:** thin 1px Control Line outline, muted, 22px ("WOMEN · DRESSES").
- **Kraft:** kraft on ink, for the portal role stamp.

### MRP Block (signature)
The printed price: a white box with a 1px Tear Line border and 4px corners, "MRP" in Soft Ink condensed caps beside the tag-red tabular figure, "(incl. of all taxes)" in muted 12px below. Sizes 20, 24 and 40px.

### Tag Card (signature)
- **Corner Style:** 6px, 1px Rule border, white, clipped.
- **Structure:** 3:4 photo well on Paper Fold, then a dashed tear line, then name (2 lines max), seller with a store icon, the MRP block, and a footer of category stamp and stock state.
- **Hover / Focus:** lifts 2px, border darkens to Tear Line, tag shadow, photo scales 1.03; an ink "Add" bar slides up over the photo edge and turns red on its own hover. The whole tag draws the focus ring for its name link.
- **Feature:** spans 2x2, 22px name, 40px MRP and a red "Add to cart" button.

### Cards / Panels
- **Corner Style:** 6px. **Background:** white on paper. **Border:** 1px Rule. **Shadow:** none at rest.
- **Internal Padding:** heads 14px by 18px with a Rule under them. Panels are never nested inside panels.

### Inputs / Fields
- **Style:** 44px, white, 1.5px Control Line border, 6px corners, 15px text, muted placeholder; label 13.5px/600 above.
- **Focus:** border turns ink plus the shared 2px ring. Hover darkens the border to Soft Ink.
- **Error / Disabled:** oxblood border on a faint pink fill with an alert-icon message; disabled is Paper Fold with a Rule border.
- **Choice controls:** checkbox checked is ink, radio checked is a red dot, switch on is green.

### Tables
Barlow caps headers (12.5px, +0.1em, muted) on Ledger Head, 44px rows with 1px Rule separators and a Row Warmth hover. Ids are condensed and tracked; totals right-aligned and tabular; statuses are stamps. The header sticks inside a scroll box and the box, not the page, scrolls sideways. Footers state "Showing 1–8 of 35 orders · incl. 1 cancelled".

### Stat Strip
A row of 4 to 5 white tiles divided by 1px Rule gaps inside one 6px frame: icon plus muted label, then the condensed ink figure with an optional muted note. Each label or note carries its qualifier ("Revenue · excl. cancelled", "cancelled excluded").

### Status Meter List (signature)
Status summaries are never donuts. One row per status: the real stamp, a 1px meter on a Rule track filled in the stamp's own colour (amber, ink, green, oxblood), the count in 18px condensed tabular ink and its share in muted text ("<1%", never a false "0%"). The head states the total with its qualifier ("35 orders · incl. 1 cancelled"). Rows can become 44px toggle filters with a Paper Fold pressed state.

### Charts
ECharts with the "flipone" theme, SVG renderer. Thin Control Line axes, chart-grid gridlines, direct labels where they fit, condensed tabular numerals, ink bars first. Sparse daily counts are bars, not lines. Every chart has a label plus a summary and/or a visually hidden data table; the hidden table sits inside a visually hidden wrapper, because tables ignore a 1px height.

### Toasts
Bottom-centre, 440px, at most 3 visible. Each is one ink row (6px corners, Float-strength shadow) with a status icon whose shape and tone carry the status (check circle green, triangle amber, alert circle coral, info kraft), the title in 14px/600 paper, an optional 13px description and a quiet outlined action. No floating close button; toasts time out at 4s (errors 6s) and can be swiped away.

### Navigation
- **Storefront header:** wordmark, wide search field with an attached ink Search button, Account menu, Saved, Cart with a red count; a category row below whose current category is underlined.
- **Portal sidebar:** ink, wordmark in paper, kraft role stamp and account name, 40px nav items in 14.5px with 20px line icons. Active is a paper-tinted fill with semibold white text and `aria-current`; there is no red marker and no coloured side bar. Avatar and log out pinned at the bottom.

## Do's and Don'ts

### Do:
- **Do** keep tag red to the one main action per view, MRP figures and the cart count.
- **Do** show every order status as a stamp (dashed PENDING, ink SHIPPED, checked DELIVERED, oxblood CANCELLED) and summarise statuses with the status meter list.
- **Do** apply one low-stock rule everywhere: 5 or fewer left reads "ONLY N LEFT".
- **Do** state a figure's qualifier whenever it differs from the plain reading ("incl. 1 cancelled", "excl. cancelled", "last 30 days").
- **Do** set prices, counts, dates and ids in tabular figures; product prices in the MRP block.
- **Do** give every interactive element a visible hover and the 2px ink focus ring at 2px offset.
- **Do** use Lucide line icons at stroke 1.75, 16 to 20px.
- **Do** keep motion to 150 to 200ms with the ease-out-quint curve, one authored moment per view, collapsed under reduced motion.
- **Do** cap content near 1600px with at least 24px gutters, and let wide tables scroll inside their panel.

### Don't:
- **Don't** use tag red for chart series, markers, dots, statuses, active nav or decoration.
- **Don't** draw status donuts or pies; use the status meter list.
- **Don't** put a thick coloured border on one side of a card, row, toast or nav item.
- **Don't** use shadows with more than 12px blur, gradients, glows, glass or backdrop blur.
- **Don't** nest cards or panels inside panels.
- **Don't** use kraft outside bands, or text lighter than Muted Ink.
- **Don't** add a floating close button to toasts.
- **Don't** invent figures, ratings, discounts or delivery promises to fill a surface.

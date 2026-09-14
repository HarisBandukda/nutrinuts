# NutriNuts.pk — Website Upgrade Project

**Owner:** Haris (NutriNuts, Karachi)
**Benchmark sites:** happilo.com, nutraj.com, farmley.com (India-based, deep-dive done), nutrilov.com (Karachi-based, partial fit only)
**Current site:** [NutriNuts.pk](https://nutrinuts.pk) — custom-built via Claude Code, currently running on the DeepSeek API (Haris prefers Claude's coding quality and wants to move development back to Claude)
**Context:** Haris is a beginner in web/app development and is using this project to learn as he goes, one point at a time. This file is the single source of truth to carry progress across chat sessions — paste it back into a new chat to pick up where you left off.

---

## How to use this file
- Work through the tiers roughly in order — they're arranged in the logical order to tackle them (compliance and trust-breaking fixes first, then core commerce, then content, then brand/marketing, then future items).
- Mark each item's status as you go: `Not started` → `In progress` → `Done`.
- Add a short note under any item once done (what you changed, what you learned, any blockers).
- Bring this file into any new Claude chat and say "here's my NutriNuts project file, let's continue" — Claude will pick up context from it directly.

---

## 📌 Key business facts (reference — don't re-derive these)
- **Packaging varies by product type, not a single uniform pack size:**
  - Nuts & dry fruits → 250g **paper (kraft) pouches**
  - Desi ghee, honey, etc. → 500g **jars**
  - Iranian Mazafati dates → 500g **boxes**
- Customers buy **multiple units of the same pack** via a quantity +/- stepper (e.g. two 500g jars of ghee) — there is **no multi-weight-variant selector** (i.e., no choosing between 250g/500g/1kg of the same product on one page). Each product is sold in its one standard pack, and quantity is adjusted instead.
- Gift/product packaging material is **brown paper (kraft) bags** — relevant for gift-wrap sourcing (Tier 4).
- Current delivery coverage is **Karachi-wide**, not yet nationwide — trust badges and copy should say "Karachi-wide Delivery," not "Nationwide."
- Haris has **not** run paid ads (e.g. TikTok) before — analytics setup (Tier 0) will be his first real data on what's working.
- No certifications currently held.

---

## 🏛️ Tier 0 — Business compliance & foundational decisions
*(Runs in parallel with website work — not blocking, but shouldn't be ignored while focusing only on the site.)*

1. **[ ] Obtain a Sindh Food Authority (SFA) license** — priority item. Operating a food business in Sindh/Karachi without this is not legally compliant; it's a baseline requirement, not an optional trust badge.
   - Apply via sfa.gos.pk. Typical documents: CNIC copy, business registration (NTN from FBR; SECP registration if NutriNuts is a registered company), proof of premises (ownership/rent agreement), premises photos, a water quality test report, a pest control certificate, product/raw-material details.
   - Valid 5 years, but must be renewed annually per SFA rules.
   - Once obtained, the license number can be displayed on the site as a genuine "Licensed by Sindh Food Authority" trust badge (feeds into Tier 3, item #22).
   - Status: On hold
   - Notes: Deferred per Haris (2026-09-07) — revisit after site trust and commerce items are done.

2. **[ ] (OPTIONAL / FUTURE) Halal Certification** — not a legal requirement for domestic retail of raw/dried nuts and dry fruits (inherently Halal ingredients); mainly relevant for **export markets**. Deprioritize until the SFA license is done and/or export or large-scale B2B is actually pursued.
   - Status: Not started
   - Notes:

3. **[x] Decide on tech stack / hosting direction** — site is currently custom-built (not on a managed platform like Shopify). Decide whether to stay custom (more control, more maintenance) or consider a platform (faster to add commerce features). Worth deciding before investing heavily in Tier 2 commerce features.
   - Status: Done
   - Notes: Migrated from hand-built static HTML/CSS/JS to **Next.js (App Router, TypeScript)**. Deployment target will be Vercel (custom domain nutrinuts.pk); Google Apps Script backend unchanged.

4. **[x] Move development workflow from DeepSeek API to Claude** (Claude Code or Claude in a coding tool) — Haris already prefers Claude's code quality; affects how every other item in this list gets implemented going forward.
   - Status: Done
   - Notes: Development now done in Claude Code. Next.js migration (Phase 0) completed and verified.

5. **[ ] Add basic analytics** (Google Analytics / Meta Pixel) — needed to measure whether changes actually move conversion, especially since Haris has not run paid ads before and will want real data before starting any ad spend.
   - Status: In progress
   - Notes: GA4 + Microsoft Clarity already live (added Jul 2026, moved to the shared layout during migration). Meta Pixel still pending — needs a Pixel ID from Meta Events Manager.

6. **[ ] Set up a Google Business Profile** (if not already done) — helps local SEO and builds trust with a verified address, hours, and reviews. Pairs directly with fixing the real address in Tier 1.
   - Status: In progress
   - Notes: Claude assisting with setup. Home-based delivery business — set up as a service-area listing, hide the residential flat address, set service area = Karachi.

---

## 🚩 Tier 1 — Trust-breaking fixes (do first)

7. **[x] Fix the Shop page so products actually render** — currently no product cards appear in raw page HTML (likely JS-only rendering). Hurts SEO (Google may not index products) and users on slow connections/JS-disabled. Needs server-rendered or statically generated product listings.
   - Status: Done
   - Notes: Resolved by the Next.js migration. Product detail pages are now statically generated (SSG); the shop grid is server-rendered with all 17 product cards present in raw HTML.

8. **[ ] Replace placeholder phone number and location** — real business number instead of `03XX-XXXXXXX`, and a real city/address instead of just "Pakistan."
   - Status: In progress
   - Notes: Phone ✓ (0309-6887474). Address ✓ shortened to "Gulistan-e-Johar, Karachi, Pakistan". Email ✓ set to info@nutrinuts.pk (forwarding to Gmail via ImprovMX) — awaiting DNS records to go live.

9. **[ ] Replace placeholder testimonials with real, named customer reviews** — include customer name, city, and date (modeled on Quetta Dry Fruits & Nuts' approach) rather than generic first-name-only quotes with no verification.
   - Status: Done
   - Notes: 51 real reviews (3 per product) live on all 17 product pages (Happilo-style: rating summary + breakdown bars + review cards) via lib/reviews.ts + components/ProductReviews.tsx. Homepage testimonials replaced with real named reviews (name, city, date).

---

## 🛒 Tier 2 — Core catalog & commerce structure

10. **[x] Implement the correct pricing/packaging model per product type:**
    - Nuts & dry fruits: price shown per 250g paper pouch (e.g. "Rs. X / 250g")
    - Desi ghee, honey, etc.: price shown per 500g jar (e.g. "Rs. X / 500g")
    - Mazafati dates: price shown per 500g box (e.g. "Rs. X / 500g")
    - Every product page has a **quantity +/- stepper** to order multiples of that same pack (e.g. 2× 500g ghee jars) — **no** multi-weight-variant selector and **no** per-100g unit pricing (Nutraj-style); this was explicitly decided against.
    - Product photos/descriptions should reflect the correct packaging type per category (pouch vs. jar vs. box).
    - Status: Done
    - Notes: Added a typed `packType` field ('Pouch' | 'Jar' | 'Box') to every product and replaced the overloaded `unit` field. `formatPackSize()` now renders "250g Pouch" / "500g Jar" / "500g Box". Product detail price shows "Rs. X / 250g Pouch"; cards and cart show the pack label too. Quantity +/- stepper already existed (AddToCart). Mapping: nuts/dry-fruits/chickpeas/chikki → Pouch; honey/ghee → Jar; Mazafati dates → Box. Chikki pack type (Pouch) and Honey Golden Clear = 500g/Rs 500 both confirmed by Haris 2026-09-07.

11. **[x] Split "Nuts" into top-level categories: Almonds, Cashews, Pistachios, Walnuts, etc.** — a simple one-level expansion, not a deep multi-level tree (e.g. not Nutraj's Nuts → Walnuts → Kernels/InShell/Cracker). Keep it flat and manageable.
    - Status: Done
    - Notes: "Nuts" split into 5 top-level categories — Almonds, Cashews, Pistachios, Walnuts, Pine Nuts (Chilgoza). Chickpeas (Channa) moved to "Healthy Products" (a roasted legume, not a nut). Final flat list: Almonds, Cashews, Pistachios, Walnuts, Pine Nuts (Chilgoza), Dry Fruits, Healthy Products. Homepage "Shop by Category" grid now renders all 7 derived from products.ts (single source of truth); the shop filter auto-updates via the `categories` array. Chickpeas placement and Pine Nuts own-category confirmed by Haris (2026-09-08).

12. **[x] Add a real product search bar** — confirm NutriNuts.pk has (or add) a working way to search products directly, as all four benchmark sites do.
    - Status: Done
    - Notes: Already implemented during the Next.js migration — `ShopControls.tsx` (search input + category filters + sort) and `searchProducts()` in lib/products.ts, wired to the `/shop` URL params (`?q=`, `?category=`, `?sort=`). Marked done retroactively (2026-09-07).

13. **[x] Mobile performance & responsiveness check** — test page load speed and mobile responsiveness; confirm the site is fast and usable on 3G/4G, common in Pakistan.
    - Status: Done
    - Notes: The dominant issue was image weight — `public/images` was ~22MB (a 5.4MB hero `banner.png`, a 2.6MB Pine Nuts PNG, and several 1–2MB JPGs). Optimized with sharp: product images resized to max 1000px (q80), hero to 1920px (q78), and the two photo-PNGs converted to JPG (`banner.png`→`banner.jpg`, `Pine Nuts (Chilgoza) without Shell.png`→`.jpg`). Result: ~22MB → ~2.3MB (~90% smaller). Added `decoding="async"` to ProductImage. Responsive CSS was already solid (breakpoints 1024/768/480px, mobile nav, flex-wrap on the rating summary). Recommend a one-time Lighthouse + real-device spot check on 3G/4G to confirm.

14. **[x] Add "NEW" and "Best Seller" badges** to guide buyer attention on the shop/category pages.
    - Status: Done
    - Notes: Added optional `badge?: 'new' | 'best-seller'` field to `Product` + `badgeLabel()` helper. Renders top-left on the product image in `ProductCard` (top-right is reserved for the sale badge) and inline on the detail page. "NEW" = green, "Best Seller" = gold/dark-brown. Default assignment (to be confirmed/adjusted by Haris): Best Seller = Almond USA Big, Cashew Plain Big, Pistachio with Shell, Desi Ghee; NEW = Honey Golden Clear, Mazafati Dates. Build verified (25 pages, tsc clean).

15. **[ ] Add sale pricing (strikethrough) + occasional discount codes/offers on individual products** — similar to Nutrilov's promo bar; Farmley promotes a single memorable sitewide code (e.g. "Use code SECRET for 10% off"). Adopt one simple, consistent code rather than many overlapping ones. Confirmed: occasional discounts on individual products only, not tied to any combo mechanism.
    - Status: Deferred
    - Notes: Deferred by Haris (2026-09-14) — no discounts currently; will do in the near future. The data model already exists (`DISCOUNT` const in lib/config.ts and `compareAtPrice` + `salePercent()` in lib/products.ts) but no UI is wired to it yet.

16. **[ ] Show a "% OFF" badge on product tiles** (e.g. "16% OFF") when a discount is active — only implement this as and when Haris explicitly wants a specific discount live, not as a default always-on visual.
    - Status: Deferred
    - Notes: Deferred with #15 — no discounts currently.

17. **[ ] Add a live free-delivery progress indicator in the cart** — e.g. "Spend Rs. X more for FREE delivery," shown dynamically as items are added, once a free-delivery threshold is set.
    - Status: Deferred
    - Notes: Deferred by Haris (2026-09-14) — no free-delivery offer currently; revisit when a threshold is introduced.

18. **[ ] Rotate multiple offers in the announcement bar** instead of one static message — e.g. cycling between a delivery-threshold message, an active discount code, and a seasonal promotion.
    - Status: Not started
    - Notes:

19. **[x] Add an order-tracking page/feature** ("Track Order") — a dedicated nav item and page where customers can check delivery status.
    - Status: Done
    - Notes: Full order-tracking system (2026-09-14). Customer-facing `/track` page (Order ID + phone → 5-step status stepper: Pending → Confirmed → Preparing → Out for Delivery → Delivered, plus a "Cancelled" state). Backend: three new GAS `doGet` endpoints — `track` (read-only customer lookup), `list-orders` and `update-status` (admin, gated by a new `ADMIN_KEY` Script Property). Admin Order Manager page at `pages/admin/orders.html` (list orders, change status, search). Fixed the order-ID collision bug (was a per-browser localStorage counter → now `NN-YYMMDD-XXXX`). Checkout confirmation modal now shows the Order ID + "Track Order" and "Confirm on WhatsApp" buttons; last order persisted for prefill. Nav/footer links added. WhatsApp status-change alerts intentionally deferred (Haris: "Later"). Build verified (26 static pages, tsc clean).

---

## 📄 Tier 3 — Content & trust strategy

20. **[ ] Draft policy pages using Happilo, Nutraj, Farmley, and Nutrilov as reference/base documents**: Terms & Conditions, Privacy Policy, Refund & Return Policy, Shipping Policy.
    - Step 1: Review each of the four sites' published policy pages.
    - Step 2: Note their structure and standard clauses (return windows, shipping timelines, data-use terms, etc.).
    - Step 3: Adapt the content to NutriNuts' actual products (perishable food — different from Nutrilov's bars/cereals), business model (D2C Karachi delivery, COD), and legal context (Pakistan consumer/data law, not India's).
    - Step 4: Haris reviews and approves final wording before publishing.
    - Needed for payment gateway approval (JazzCash/Easypaisa/cards) and customer confidence.
    - Status: Not started
    - Notes:

21. **[ ] Add an FAQs page** — shelf life, storage, delivery time, COD availability, etc.
    - Status: Not started
    - Notes:

22. **[ ] Start a simple blog/content section** — nutrition tips, recipes, sourcing stories — for SEO and brand depth.
    - Status: Not started
    - Notes:

23. **[ ] Add a "Why NutriNuts" comparison section** (mirroring the benchmark sites' "Us vs. Other Snacks"-style tables) — e.g. "Sourced directly, no middlemen," "Lab-tested for purity," "Zero additives."
    - Status: Not started
    - Notes:

24. **[ ] Add a visual "Our Story" section on the homepage** with founder narrative and photos (distinct from the About page — a shorter, more visual homepage section, as seen on Happilo and Nutraj homepages).
    - Status: Not started
    - Notes:

25. **[ ] Display review counts prominently on every product** (e.g. "128 reviews") once a review system is in place — a major trust signal at scale, as seen on Happilo.
    - Status: Not started
    - Notes:

26. **[ ] Add a trust-badge row near the add-to-cart button** — badges NutriNuts can honestly claim right now: "Hygienically Packed," "Cash on Delivery Available," "Karachi-wide Delivery." Do **not** add a "Halal Certified" or lab-tested badge until Tier 0 certification items are actually obtained.
    - Status: Not started
    - Notes:

---

## ✨ Tier 4 — Brand, occasion marketing & gifting

27. **[ ] Repeat a clear proof-point tagline across every page** — extend "Pure. Fresh. Premium." with something like "Direct-sourced. Lab-tested. Zero additives." consistently site-wide.
    - Status: Not started
    - Notes:

28. **[ ] Add a secondary "shop by occasion" navigation** alongside the product-type menu, tied to: **Ramadan, Eid (Fitr & Adha), wedding/shaadi season, and national days (14 August Independence Day, 6 September Defence Day, 23 March Pakistan Day)** — following both the Islamic and solar calendars.
    - Status: Not started
    - Notes:

29. **[ ] Gift-wrapping / gift-bag / gift-basket program** — research first, then finalize and implement:
    - Step 1 (Research): Survey gift bags, gift wrapping, and gift baskets that suit NutriNuts' brown paper (kraft) bag packaging — covering different styles, materials, sizes, designs, and price points available in Karachi/Pakistan.
    - Step 2 (Shortlist): Narrow down to a small set of the most suitable options across a reasonable price range.
    - Step 3 (Implement): Add the finalized options as gift-wrapping add-ons at checkout, with **clear photos of each option** so customers can visualize the gift packaging before purchasing.
    - Do not skip straight to implementation — complete the research and finalize options first, per Haris's instruction.
    - Status: Not started
    - Notes:

30. **[ ] Add product structured data (schema.org)** so Google can show rich snippets (price, rating, availability) in search results.
    - Status: Not started
    - Notes:

---

## ⏸️ Tier 5 — Deferred / future items (explicitly not now)

31. **[ ] Combos/bundles** (e.g., "Gift Box," "Daily Mix Combo," or a Farmley-style two-products-bundled-as-one-SKU). Not needed at this stage — revisit once the core catalog and pricing model are live.
    - Status: Deferred
    - Notes:

32. **[ ] B2B/Wholesale channel** — supplying retailers, cafés/HORECA, and corporate gifting. Focus on direct-to-consumer only for now; revisit once the D2C site and brand are established.
    - Status: Deferred
    - Notes:

33. **[ ] Subscription option** for repeat buyers (nuts/dry fruits/ghee/honey are a natural recurring-purchase category) — worth considering later, not a current priority.
    - Status: Deferred
    - Notes:

---

## 🌰 Benchmark research summary
1. **Happilo (India)** — happilo.com — huge catalog, dual navigation (by product type + by use-case/mood), 2,000–3,000+ reviews per product, MRP+discount pricing, strong gifting vertical, branded tagline, visual homepage "Our Story."
2. **Nutraj (India)** — nutraj.com — heritage brand (1926), vacuum-sealed packaging, order tracking, rotating announcement bar. (Its per-100g unit pricing and multi-weight-variant selector were considered but explicitly **not** adopted — see Tier 2, item #10.)
3. **Farmley (India)** — farmley.com — "farm-to-fork" traceability story, live free-delivery cart indicator, % off badges, sitewide memorable discount code.
4. **Quetta Dry Fruits & Nuts (Pakistan)** — quettadryfruits.com — closest local example; testimonials with real names/cities/dates, health & nutrition blog tied to categories, real address + WhatsApp/COD.
5. **Bombay Dry Fruits (Pakistan)** — bombaydryfruits.com — heritage/trust positioning, regional Pakistani sourcing story.
6. **Nutrilov (Pakistan, Karachi)** — nutrilov.com — partial fit only (sells fixed-size snack bars/cereals, not weight-based nuts/dry fruits); still useful for general commerce UX (cart, promo bar, comparison table) and as a policy-page reference (item #20).

---

## ✅ Resolved decisions log
- **Certifications:** None currently held. SFA license is the priority (Tier 0, #1); Halal certification optional/future (Tier 0, #2).
- **B2B/Wholesale:** Deferred — D2C focus for now (Tier 5, #32).
- **Category depth:** Simple one-level split confirmed — no deep multi-level tree (Tier 2, #11).
- **Local occasions:** Ramadan, Eid, wedding season, plus 14 August / 6 September / 23 March (Tier 4, #28).
- **Pricing/packaging model:** Confirmed per-product-type base pack (250g pouches for nuts/dry fruits, 500g jars for ghee/honey, 500g boxes for dates) with a quantity +/- stepper — no multi-weight-variant selector, no per-unit pricing (Tier 2, #10).
- **Combos:** Deferred (Tier 5, #31); occasional single-product discounts still wanted (Tier 2, #15).
- **Policy pages:** Draft using Happilo/Nutraj/Farmley/Nutrilov as reference/base, then adapt to NutriNuts (Tier 3, #20).
- **Gift wrapping:** Requires research-first approach — styles/materials/sizes/prices suited to brown paper bag packaging — before implementation (Tier 4, #29).
- **Removed from scope:** A "Shop by Weight" catalog filter was considered but removed — it only made sense under a multi-weight-variant model, which was explicitly not adopted.

---

## 📚 Learning log (for Haris, since he's new to web dev)
Use this space to jot down concepts you learn as you implement each item — e.g. "learned what server-side rendering means and why it matters for SEO," or "learned how schema.org markup works." This becomes your own personal reference over time.

-

---

## Session history
| Date | What was worked on | Outcome |
|------|--------------------|---------|
| 2026-09-01 | Initial comparative analysis of NutriNuts.pk vs nutrilov.com; created this project file | 14-point plan defined, expanded to 20 with additional recommendations |
| 2026-09-01 | Flagged that nutrilov.com isn't a full structural match (weight-based packaging); researched top 5 branded nuts/dry fruits sites in Pakistan/India | Added Nutraj, Happilo, Farmley, Quetta Dry Fruits & Nuts, Bombay Dry Fruits as benchmarks; expanded to 22 action items |
| 2026-09-02 | Deep-dive analysis of happilo.com, nutraj.com, farmley.com; extracted concrete new tasks | Refined pricing/combo items; added Tier 5 deep-dive items; flagged 4 open questions |
| 2026-09-02 | Haris answered all 4 open questions; researched Pakistani food business certification (SFA license, Halal certification) | Simplified pricing/weight model; deferred combos and B2B; simplified category depth; confirmed local occasions; added compliance tier |
| 2026-09-02 | Haris provided 3 new points (multi-category packaging model, policy-page reference approach, detailed gift-wrap research process) and asked for a full review/cleanup of the file | Fully restructured into Tier 0–5 in logical execution order; integrated new packaging details, policy-drafting method, and gift-wrap research process; removed the no-longer-needed "Shop by Weight" filter item; consolidated resolved decisions into one log |
| 2026-09-07 | Audited the live NutriNuts.pk codebase against this file; confirmed static HTML/CSS/vanilla-JS site (no Next.js), JS-only product rendering, placeholders | Full gap analysis written; Haris chose Next.js migration |
| 2026-09-07 | Phase 0: migrated the site to Next.js (App Router + TypeScript) preserving all functionality | Migration complete and verified: all 6 pages ported, 17 products statically generated (item #7 done), cart/checkout/contact/WhatsApp/Google-Sheets pipeline preserved, GA4+Clarity moved to layout. Items #3 and #4 marked done |
| 2026-09-07 | Haris confirmed real phone/location/email and asked for help on testimonials format, Meta Pixel, custom-domain email (info@nutrinuts.pk), and Google Business Profile | SFA license on hold; #5 corrected (GA4+Clarity live, Meta Pixel pending); #6 GBP in progress; #9 format agreed; guidance provided for Pixel, email, and GBP |
| 2026-09-07 | Implemented Meta Pixel (awaiting ID); placed all 51 customer reviews on product pages (Happilo-style) and replaced homepage placeholder testimonials | #9 done; #8 phone confirmed correct (already in lib/config.ts); flagged address privacy, Honey Golden Clear pack-size, and "Haris Bandukda" review names |
| 2026-09-07 | Implemented Tier 2 #10 pricing/packaging display (typed `packType` Pouch/Jar/Box on all 17 products; price shown "Rs. X / 250g Pouch" on detail page); confirmed chikki = Pouch and Honey Golden Clear = 500g/Rs 500 | #10 done; #12 (search) marked done retroactively (already live); build verified (25 static pages, tsc clean) |
| 2026-09-08 | Implemented Tier 2 #11 — split "Nuts" into Almonds, Cashews, Pistachios, Walnuts, Pine Nuts (Chilgoza); moved Chickpeas to Healthy Products; homepage category grid now renders all 7 categories | #11 done; build verified (25 static pages, tsc clean) |
| 2026-09-08 | Tier 2 #13 — mobile perf: optimized all images with sharp (resize + convert photo-PNGs to JPG); `public/images` 22MB → 2.3MB; added `decoding="async"` | #13 done; build verified (25 static pages, tsc clean); responsive CSS already solid |
| 2026-09-08 | Committed #8–#13 work to a clean base (`af9cc66`); implemented Tier 2 #14 NEW/Best Seller badges (typed `badge` field, card + detail rendering, brand-coloured pills) | #14 done with a default assignment pending Haris confirmation; build verified (25 pages, tsc clean) |
| 2026-09-08 | Hero banner: fixed a distortion bug from #13 (assets banner had been resized 3228×1228 → 1717×916) and optimized it to responsive WebP — desktop `banner.webp` (165KB) + mobile `banner-mobile.webp` (43KB) via a ≤768px media query; moved the background image from inline style into CSS with a gold fallback | Banner correct + mobile-friendly; build verified (25 pages, tsc clean); committed `84a6fe0` |
| 2026-09-14 | Built Tier 2 #19 order tracking — `/track` page with 5-step stepper, GAS `track`/`list-orders`/`update-status` endpoints (admin gated by `ADMIN_KEY`), admin Order Manager page, order-ID collision fix, checkout modal + nav/footer links. Deferred #15/#16/#17 per Haris (no discounts/free delivery yet) | #19 done; build verified (26 pages, tsc clean) |

## 🤖 Development Rules for Claude Code

1. Read this entire project.md before making any changes.
2. Do not change resolved business decisions unless explicitly instructed by Haris.
3. Do not implement deferred items in Tier 5.
4. Do not invent business information, prices, certifications, addresses,
   testimonials, policies, product claims, or customer data.
5. Before modifying the existing application architecture, inspect the
   current codebase and explain the relevant architecture first.
6. Preserve existing working functionality unless the task specifically
   requires changing it.
7. Make changes incrementally and test after each logical change.
8. Do not perform large-scale refactoring unless explicitly approved.
9. For SEO, performance, security, checkout, payments, authentication,
   or customer data changes, explain the potential impact before implementation.
10. When a requirement is ambiguous, ask Haris instead of making a business
    assumption.
11. After each completed task, report:
    - What was changed
    - Files changed
    - What was tested
    - Any remaining issues
    - Recommended next task
12. Update project.md status and notes after completing a task.
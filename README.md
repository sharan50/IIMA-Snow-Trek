# IIMA Snow Trek 2027

Website for the IIMA alumni Snow Trek — the annual alumni Snowflake trip. Edition I went to Cervinia in the Italian Alps; Edition II heads to Almaty and Shymbulak, Kazakhstan for a 4-night, 4-full-day trip focused on learning to ski/snowboard and winter experiences in Kazakhstan (no professional-networking framing — see below).

## Structure

Static site, no build tooling required:

```
index.html        Home
itinerary.html     Day-by-day itinerary
activities.html    Shymbulak snow activities + Almaty non-snow activities
pricing.html       Pricing tiers, inclusions/exclusions
faq.html           FAQ (visa, weather, packing, currency, etc.)
register.html      RSVP / registration form
success.html       Form submission confirmation
css/style.css      Shared stylesheet
js/main.js         Nav toggle, tabs, FAQ accordion, form submit
js/calculator.js   Trip cost calculator (archetypes + breakdown)
js/game.js         Click-to-load embed for the ski simulator
game.html          Fall Line, the ski simulator (wrapper page + controls)
simulator/index.html        Vendored copy of the game itself — see below
functions/api/register.js   Pages Function: saves to D1, forwards the email
_headers           Security headers for Cloudflare Pages
```

## The ski simulator

`simulator/index.html` is a **copy** of Fall Line, the single-file browser ski game
from [`sharan50/dhruv-bakchodi`](https://github.com/sharan50/dhruv-bakchodi)
(branch `claude/html-skiing-game-fwa4gu`, commit `e30568c`, 10 Aug 2026). It is one
self-contained HTML file — no build step, no dependencies, no assets, no network
calls — so vendoring it is just a file copy.

To update it, copy that repo's `index.html` over `simulator/index.html`, keeping the
provenance comment at the top. Never edit the copy directly.

Two reasons it is served from this origin rather than framed from its own Netlify
deploy: the page then does not depend on a second deploy staying up, and same-origin
framing cannot be blocked by the other host's `X-Frame-Options`.

That last point cuts both ways: this site sends `X-Frame-Options: DENY` on every
response, which blocks same-origin framing too. `_headers` therefore detaches that
header for `/simulator` and `/simulator/*` and sets
`Content-Security-Policy: frame-ancestors 'self'` instead, so the game can be framed
by our own pages and by nobody else's. A second `X-Frame-Options` line would not have
worked — Cloudflare joins repeated headers with a comma rather than replacing them.

The game is **keyboard-only** (arrows/AD to steer, Q/W/E for effort, SPACE to drop
in), so it is not playable on a phone. `game.html` says so, and the home page teaser
tells people to open it on a laptop.

## Deploying on Cloudflare Pages

1. Connect this GitHub repo to a Cloudflare Pages project.
2. Framework preset: **None**. Build command: leave empty. Build output directory: `/` (repo root).
3. `_headers` sets the security headers Cloudflare Pages applies to every response.

## Registrations

Registrations post to `/api/register` (a Cloudflare Pages Function). That function
writes the row to a **D1 database** — the source of truth — and then forwards the
submission to Web3Forms so an email still arrives immediately.

### Cloudflare setup required before this works

In the Pages project → **Settings → Bindings**:

| Type | Variable name | Value |
|------|---------------|-------|
| D1 database | `DB` | `iima-snow-trek` (id `44e6e590-243b-4064-88a0-09849894e775`) |
| Environment variable | `WEB3FORMS_KEY` | `eadc4ead-afb0-473d-988f-7d4347d656d6` |

Add both to **Production** (and Preview if you use it), then redeploy. Without the
`DB` binding the endpoint returns an error rather than dropping registrations
silently. Without `WEB3FORMS_KEY` the row is still saved and only the email is
skipped.

The Web3Forms key now lives in an environment variable rather than in page source,
so it is no longer public.

### The database

Schema is `registrations`, already created. Alongside the submitted fields it
carries organiser-managed columns — `status`, `deposit_paid`, `amount_paid`,
`organiser_notes`, `updated_at` — so the trip can be run off this table rather
than out of an inbox: who has paid, who needs a roommate, who is flying from
where.

Query it from the Cloudflare dashboard (D1 → iima-snow-trek → Console), via
`wrangler d1 execute iima-snow-trek --command "..."`, or by asking Claude, which
can read and write it directly.

Free tier is 250 Web3Forms emails per month and 5 GB of D1 storage — ample.

**Before sharing the link: submit one real test registration and confirm the email
arrives.** Nothing else verifies the endpoint end to end.

Notes:

- A hidden `botcheck` honeypot filters most bots; a submission carrying it returns
  success to the bot but writes nothing.
- The form only shows its confirmation when the endpoint actually accepts the
  submission. A failed post surfaces the real error and tells the visitor to email
  instead, so a registration can never be silently lost.
- Visitors with JavaScript disabled currently see the raw JSON response after
  posting. If that matters, add a `redirect` back once the final domain is known.

> Previously this site was built for Netlify Forms (`data-netlify="true"`), which only
> works on Netlify. On any other host that form silently discarded every submission
> while still showing a success message, so it was replaced.

## Currency handling

Every price is stored in the currency it was quoted in and converted exactly once, at
display time, by `inrOf()` in `js/calculator.js`. Rates (as at 20&ndash;21 Nov 2026):
US$1 = &#8377;92.97 (RBI reference, 20 Nov), 455 KZT = US$1 (National Bank of Kazakhstan,
21 Nov), &pound;1 = &#8377;121.93 (RBI reference, 20 Nov), S$1 = &#8377;72.0 (20 Nov).
Changing a rate is a one-line edit in `FX`; nothing is pre-converted and stored, so no
two figures can drift apart.

## Things to update before sharing

- [x] Organizer email set to `p24dhruv@iima.ac.in` across all pages.
- [x] Trip dates locked to Republic Day weekend: Fri Jan 22 &ndash; Tue Jan 26, 2027 (4 nights, 4 full days: 1 arrival day + 4 full days, anchored on the Jan 26 holiday).
- [~] **Flights: four hubs verified, Bengaluru held.** All observations 21 Nov 2026, 1 adult economy round trip, taxes/fees included, per person, as full round-trip selections (outbound *and* return chosen, booking-page total read). **No fare includes checked baggage** &mdash; the exclusion prints beside each fare on the page.
  - **Delhi &mdash; verified, Rs 39,120.** Air Astana nonstop both ways (out 22 Jan 08:10 &rarr; ALA 11:15; back 26 Jan 14:40 &rarr; DEL 18:55). Outbound 1 cabin + 2 free checked; return first checked bag chargeable. Rs 39,120 via OTA; direct with Air Astana Rs 41,320.
  - **Mumbai &mdash; verified, Rs 53,375.** Out Air India + Air Astana via DEL (2h55 layover), 22 Jan 03:05 &rarr; ALA 11:15. Back Air Astana nonstop 26 Jan 22:35 &rarr; BOM 04:05+1. BudgetAir Rs 53,375; Expedia Rs 56,637. The cheaper Rs 52,350 Air Arabia lands 01:30 on 23 Jan &mdash; excluded.
  - **Singapore &mdash; verified, SGD 1,221** (Jettzy OTA; direct with AirAsia X SGD 1,245 incl. SGD 50 card fee). Out Thai AirAsia + Thai AirAsia X, SIN 11:00 &rarr; ALA 23:05 on 22 Jan, 5h25 at Bangkok DMK &mdash; **self-transfer on separate tickets**. Back AirAsia X + AirAsia, ALA 19:00 on 26 Jan &rarr; SIN 08:20 on 27 Jan, 1h05 at KL &mdash; **transfer type unverified, do not label it self-transfer**. 1 free cabin bag; first checked bag chargeable.
  - **London &mdash; verified, GBP 315** (Pegasus, "Light"). Out STN 12:55 on 22 Jan &rarr; ALA 04:40 on 23 Jan, 1h45 at SAW. Back ALA 05:45 on 26 Jan &rarr; STN 14:35, 3h35 at SAW. Light fare: cabin bag **and** first checked bag both chargeable, no changes, no refunds; Saver GBP 358 includes both free; Comfort Flex GBP 400 refundable. Phrasing is fixed: *among the 22 Jan departures searched* every option arrives early on the 23rd &mdash; **do not assert that no London route is available**, and **do not say the first hotel night is wasted**; say a late-arrival/early-check-in arrangement is needed and that holding the night of 22 Jan is what can enable immediate check-in (to be arranged, not guaranteed). The 05:45 return means leaving mid-night on the 26th, so no last-morning activity.
  - **Bengaluru &mdash; no booking-verified fare found in the routings checked.** Observations ran Rs 56,600&ndash;67,000 depending on routing and none could be booked: Air Arabia same-day combos via Sharjah (Rs 56,614&ndash;56,802) were rejected at the booking step **three times** as no longer available; Air India + Air Astana via DEL (BLR 00:15 &rarr; ALA 11:15 on 22 Jan; back ALA 14:40 on 26 Jan &rarr; BLR 00:25 on 27 Jan, listed Rs 66,192&ndash;67,035) returns "We can't find booking options for this itinerary". The range is published as an **unverified observation only**, excluded from every total and from any cheapest-origin comparison. The Rs 55,087 headline lands 01:30 on 23 Jan &mdash; excluded on arrival time too. Selecting BLR contributes no airfare and raises an on-screen land-only notice.

  `CONFIG.flights` carries `status` (`verified` / `unverified` / `pending` / `none`), `bagsShort` and `advisory` per origin; the breakdown note, the table pill, the baggage line and the calculator notice all derive from those, so filling in a held fare is a one-place edit.


- [x] Land package pricing in `pricing.html` refreshed 21 Nov 2026 across 5 accommodation archetypes, rebuilt from named properties observed for 22&ndash;26 Jan 2027 (International Hotel Astana Twin Standard $246.04, InterContinental King Classic Accessible $1,088.15, Holiday Inn Express $587.04, InterContinental Pasha suite $6,938.61, and the cheapest hostel dorm beds $21&ndash;28), plus Shymbulak lift passes, Free Life gear hire and AlaGo transfers. The "&plusmn;15%" band and the "25th percentile" claim were dropped &mdash; no saved sample supported either; the wording is now "low-end planning assumptions".

  **Rules these figures are published under** (do not relax without re-checking the sources):
  - Indicative observations dated 21 Nov 2026 only &mdash; never described as live, guaranteed, or group rates, and no claim that 30 people could be accommodated.
  - No star ratings are claimed anywhere on the site.
  - **Occupancy is a keyed basis, never arithmetic.** Each room in `js/calculator.js` carries `occupancies`, keyed by how many people the quote covers, and each entry is its own separately obtained observation. A sole-occupancy total is **never halved** to make a per-person figure. `compute()` picks the basis matching the people actually in the room, names it in the breakdown, and flags a mismatch rather than carrying a price across. Sole occupancy: Astana Twin $246.04 + KZT 5,022; IC King Classic Accessible room-only $1,088.15. Twin-share (2 adults, separate observations taken 21 Nov 2026; dated observations, not live rates): Astana Twin w/ breakfast $261.18 (tax $25.07) + KZT 5,331.44, free before 20 Jan 2027 then a conditional partial refund per the rate's dated terms; IC 2 Twin Classic room-only $1,088.15 (tax $137.13), nothing at property, breakfast variant $1,491.36, **cancellation unconfirmed**; Renion Hills Twin w/ breakfast $448.97 (tax $43.10) + KZT 9,164.74, **cancellation unconfirmed** (empty refund tiers are not "non-refundable"). Family rooms keep the 2A+2C (ages 8/6 illustrative) quotes.
  - Amounts payable at the property are separate line items, never folded into the booking total.
  - **Cancellation: only four facts are confirmed** &mdash; Astana (free until 20 Jan 2027 16:30 IST, then a conditional partial refund of $121.24 per the rate's dated terms), HIEX family (a conditional partial refund of $381.87 of $587.04 per the rate's dated terms; flex $674.91 refunds in full before 15 Jan), BW Atakent (free until 19 Jan 2027, 4pm hotel time), IC Pasha suite (a conditional partial refund of $4,522.65 of $6,938.61 per the rate's dated terms). **Renion Hills and the cheapest InterContinental rates are UNCONFIRMED** &mdash; empty refund tiers and no-show conditions do not settle cancellation, so they must never be written up as non-refundable. No blanket claims.
  - Family quotes use **illustrative** children aged 8 and 6 &mdash; an example the booking sites priced, never our group's composition. Child breakfast/deposit extras are uncertain and the page says so.
  - Best Western Plus Atakent Park had only one suite at the quoted rate &mdash; flagged as capacity-limited.
- [ ] **No full 2026/27 day tariff was found published on Shymbulak's season page as at 21 Nov 2026.** As at 21 Nov 2026 the new season page (effective 19 Nov 2026) carries only the beginner "Under Low" rate: 8,000 KZT adult / 5,000 KZT child (6&ndash;14), flat across weekdays and weekends, limited slopes. The calculator therefore runs on last season's 9,000 / 12,000 / 3,000 KZT rates, labelled as such on the page. Replace them as soon as the resort publishes.
- [ ] Two figures remain unverified and are labelled on the page: the $22 half-day beginner group lesson (not re-confirmed for 2026/27) and the 10,000 KZT banya visit (Arasan's price page still exposes no readable rates). The snack allowance inside the food bands is a stated assumption too.
- [x] Medeu skating removed everywhere as an offered add-on &mdash; the rink is still closed for reconstruction, reopening expected around the 2027&ndash;28 winter season. `activities.html` keeps a short "closed" note; the calculator option and its presets are gone.
- [x] Food &amp; drink estimate in `pricing.html` re-tested 21 Nov 2026 against Numbeo Almaty for November 2026 (inexpensive meal 6,000 KZT; three-course mid-range for two 20,000 KZT; fast-food combo 4,000 KZT). The old ~₹650 casual-meal and ~₹1,600 mid-range dinner lines were both roughly half the current benchmarks, so the whole band moved up to ₹6,947&ndash;₹17,164 per person.
- [ ] Optional: add a testimonials section to `index.html` once real quotes from Edition I participants are available. The original placeholder section was removed rather than shipped with invented quotes.
- [x] Real destination photos added (hero backgrounds, home page gallery, activities banners/thumbnails) — all hotlinked from Wikimedia Commons via `Special:FilePath`. Several are CC BY-SA (attribution required); a general "Photos: Wikimedia Commons contributors" credit is on the home and activities pages, but double-check individual file pages on commons.wikimedia.org and add specific photographer credit if required before wide public launch.
- [x] Ski simulator added: `game.html` wraps a same-origin embed of Fall Line, with the real controls documented from the game's source, plus a teaser on the home page and a "Ski Game" nav entry. Adding an eighth nav item pushed the header over one line, so the mobile menu now collapses at 1000px rather than 860px.
- [ ] Confirm Kazakhstan visa guidance is accurate for your group's nationalities before publishing the FAQ answer as final.
- [x] Dropped the professional-networking/mixer framing site-wide per updated direction: removed the dedicated `events.html` page, renamed the evening events (Welcome Reception → Welcome Dinner, Apres-Ski Mixer → Apres-Ski Hangout, Alumni Gala Dinner &amp; Fireside Chat → Group Dinner Night), and reworded home page copy to center on learning to ski/snowboard and winter experiences rather than alumni networking.

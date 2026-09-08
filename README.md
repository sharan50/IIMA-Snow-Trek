# IIMA Snow Trek 2027

Website for the IIMA alumni Snow Trek — the annual alumni Snowflake trip. Edition I went to the Dolomites; Edition II heads to Almaty and Shymbulak, Kazakhstan for a 4-night, 4-full-day trip focused on learning to ski/snowboard and winter experiences in Kazakhstan (no professional-networking framing — see below).

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
functions/api/register.js   Pages Function: saves to D1, forwards the email
_headers           Security headers for Cloudflare Pages
```

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

## Things to update before sharing

- [x] Organizer email set to `p24dhruv@iima.ac.in` across all pages.
- [x] Trip dates locked to Republic Day weekend: Fri Jan 22 &ndash; Tue Jan 26, 2027 (4 nights, 4 full days: 1 arrival day + 4 full days, anchored on the Jan 26 holiday).
- [x] Flight cost estimates added to `pricing.html` for Delhi/Mumbai/Bengaluru/Singapore/London, based on live search data (Sept 2026) and sanity-checked against a real Google Flights quote &mdash; recheck ~3-4 months before departure once fares firm up.
- [x] Land package pricing added to `pricing.html` across 5 accommodation archetypes (Single Economic/Luxury, Single Grouped/Dorm, Family Economic/Luxury), built up from live Almaty hotel, lift-pass, rental, and transfer costs for 4 nights (Sept 2026) &mdash; still not contracted group rates, expect ±15% movement once real vendor quotes come in. The "Family Economic" room rate was corrected from an unrealistically cheap $55/night to ~$120/night after review (see pricing page footnote for the full breakdown).
- [x] Food &amp; drink (non-package meals, snacks, incidentals) cost estimate added to `pricing.html`, grounded in Numbeo Almaty cost-of-living data and Shymbulak's on-mountain food prices.
- [ ] Optional: add a testimonials section to `index.html` once real quotes from Edition I participants are available. The original placeholder section was removed rather than shipped with invented quotes.
- [x] Real destination photos added (hero backgrounds, home page gallery, activities banners/thumbnails) — all hotlinked from Wikimedia Commons via `Special:FilePath`. Several are CC BY-SA (attribution required); a general "Photos: Wikimedia Commons contributors" credit is on the home and activities pages, but double-check individual file pages on commons.wikimedia.org and add specific photographer credit if required before wide public launch.
- [ ] Confirm Kazakhstan visa guidance is accurate for your group's nationalities before publishing the FAQ answer as final.
- [x] Dropped the professional-networking/mixer framing site-wide per updated direction: removed the dedicated `events.html` page, renamed the evening events (Welcome Reception → Welcome Dinner, Apres-Ski Mixer → Apres-Ski Hangout, Alumni Gala Dinner &amp; Fireside Chat → Group Dinner Night), and reworded home page copy to center on learning to ski/snowboard and winter experiences rather than alumni networking.

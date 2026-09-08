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
register.html      RSVP / interest registration form (Netlify Forms)
success.html       Form submission confirmation (no-JS fallback)
css/style.css      Shared stylesheet
js/main.js         Nav toggle, tabs, FAQ accordion, AJAX form submit
netlify.toml       Netlify build/publish config
```

## Deploying on Cloudflare Pages

1. Connect this GitHub repo to a Cloudflare Pages project.
2. Framework preset: **None**. Build command: leave empty. Build output directory: `/` (repo root).
3. `_headers` sets the security headers Cloudflare Pages applies to every response.

## Registrations

The form on `register.html` posts to [Web3Forms](https://web3forms.com), which emails each
submission to the organiser. There is no backend to run and it is host-agnostic.

**Setup — the form will not work until this is done:**

1. Go to web3forms.com, enter `p24dhruv@iima.ac.in`, and they email you an access key (a UUID).
2. In `register.html`, replace `PASTE-YOUR-WEB3FORMS-ACCESS-KEY-HERE` with that key.
3. Update the `redirect` hidden field to your real domain, so the no-JavaScript
   fallback lands on the right `success.html`.
4. Redeploy, then **submit a real test registration and confirm the email arrives**
   before sharing the link.

Until the key is set, the form deliberately refuses to submit and tells the visitor
to email instead — it never shows a false confirmation. Free tier is 250 submissions
per month, which is ample for a ~30-person trip.

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

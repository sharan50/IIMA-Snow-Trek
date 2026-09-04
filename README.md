# IIMA Snow Trek 2027

Website for the IIMA alumni Snow Trek — the annual alumni Snowflake trip. Edition I went to the Dolomites; Edition II heads to Almaty and Shymbulak, Kazakhstan for a 4-day, 3-night trip combining skiing/snowboarding, Almaty city experiences, and alumni networking events.

## Structure

Static site, no build tooling required:

```
index.html        Home
itinerary.html     Day-by-day itinerary
activities.html    Shymbulak snow activities + Almaty non-snow activities
events.html        Networking & mixer events
pricing.html       Pricing tiers, inclusions/exclusions
faq.html           FAQ (visa, weather, packing, currency, etc.)
register.html      RSVP / interest registration form (Netlify Forms)
success.html       Form submission confirmation (no-JS fallback)
css/style.css      Shared stylesheet
js/main.js         Nav toggle, tabs, FAQ accordion, AJAX form submit
netlify.toml       Netlify build/publish config
```

## Deploying on Netlify

1. Connect this GitHub repo to a new Netlify site.
2. Build command: none needed (or leave as configured in `netlify.toml`).
3. Publish directory: `.` (repo root).
4. The registration form on `register.html` uses [Netlify Forms](https://docs.netlify.com/forms/setup/) — no backend needed. Submissions show up under **Site settings → Forms** in the Netlify dashboard. Consider adding a notification (email/Slack) under **Forms → Form notifications** so you see new sign-ups.

## Things to update before sharing

- [x] Organizer email set to `p24dhruv@iima.ac.in` across all pages.
- [x] Trip dates locked to Republic Day weekend: Sat Jan 23 &ndash; Tue Jan 26, 2027.
- [x] Flight cost estimates added to `pricing.html` for Delhi/Mumbai/Bengaluru/Singapore/London, based on live search data (Sept 2026) and sanity-checked against a real Google Flights quote &mdash; recheck ~3-4 months before departure once fares firm up.
- [ ] Fill in real per-person **land package** pricing on `pricing.html` (still `$X,XXX` placeholders &mdash; needs actual hotel/lift-pass/transfer/dinner vendor quotes, which flight-search tools can't provide).
- [ ] Swap the placeholder Edition I testimonials on `index.html` for real quotes/photos.
- [ ] Add real photos (hero background is currently a CSS/SVG mountain silhouette).
- [ ] Confirm Kazakhstan visa guidance is accurate for your group's nationalities before publishing the FAQ answer as final.

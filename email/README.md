# Alumni invitation email — Edition II

`invite-2027.html` is the HTML invitation; `invite-2027.txt` is the plain-text
alternative to send as the `text/plain` part of the same multipart message. Send
both — a text part measurably improves deliverability and is what some clients
and screen readers show.

## Before you send

1. **Replace the placeholder domain.** Both files link to
   `https://iimasnowtrek.pages.dev`. Find-and-replace it with the real deployed
   Cloudflare Pages domain — one pass covers every link in each file.
2. **Replace `{{UNSUBSCRIBE_URL}}`** with whatever token your sending platform
   uses, and add a `List-Unsubscribe` header. Anything sent to a full alumni
   list needs a working opt-out, both to stay lawful and to keep the mail out
   of spam folders.
3. **Confirm the visa claim for your actual group.** The email states plainly
   that Indian passport holders enter Kazakhstan visa-free for up to 14 days.
   Verify it against Kazakhstan's official guidance on the day you send, and
   note that alumni on other passports (and OCI holders travelling on a
   non-Indian passport) may need an e-Visa. The footer says as much, but the
   [FAQ answer](../faq.html) is still written generically and is worth
   tightening once you know the group's nationalities.
4. **Sanity-check the numbers** against `pricing.html` if it has changed since
   September 2026 — the email quotes ₹25,500 (dorm), ₹36,000–43,000 (private
   room) and ₹28,500–62,000 (flights).
5. **Send yourself a test** and open it in Gmail (web + iOS), Outlook desktop,
   and Apple Mail before it goes to the list. Check it with images blocked too:
   nothing in this email depends on an image loading.

## Subject line options

Lead with the visa-free angle — it is the detail that makes the trip feel
possible rather than aspirational.

- `Snow Trek Edition II: Kazakhstan, and no visa needed`
- `The Snowflake goes to Kazakhstan — 22–26 Jan 2027`
- `Visa-free skiing: Snow Trek 2027 is in Kazakhstan`
- `From the Dolomites to the Tien Shan — Snow Trek Edition II`

Preheader text is already set inside the HTML (the grey line beside the subject
in the inbox); update it if you change the subject substantially.

## Technical notes

- Table-based layout with inline styles, 600px wide, stacking to full width
  below 620px. The `<style>` block is progressive enhancement only.
- Both CTAs are padded-anchor "bulletproof" buttons rather than background
  images, so they render in Outlook.
- The hero photo is hotlinked from Wikimedia Commons via `Special:FilePath`
  with `?width=1200` so it serves a resized file rather than the full-resolution
  original. It carries descriptive alt text. For a large send, consider hosting
  the image yourself instead of hotlinking Commons.
- Photo credit and the Commons attribution line are in the footer, matching the
  site. If the specific file requires named photographer credit under CC BY-SA,
  add it before a wide send.

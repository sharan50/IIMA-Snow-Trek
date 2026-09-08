/**
 * POST /api/register
 *
 * Receives a registration, writes it to D1, and forwards it to Web3Forms so the
 * organiser still gets an instant email.
 *
 * The D1 write is what matters — it is the source of truth and the thing that
 * can be queried later. The email is a convenience. So the two are handled
 * differently on failure:
 *
 *   - D1 write fails  -> return an error. The visitor is told, and retries.
 *   - Email fails     -> still return success. The registration IS recorded;
 *                        losing the notification is not worth making someone
 *                        think they failed to register.
 *
 * Requires a D1 binding named DB (Pages > Settings > Bindings) and, optionally,
 * a WEB3FORMS_KEY environment variable. If the key is absent the email step is
 * skipped and the row is still saved.
 */

const FIELDS = [
  'name', 'email', 'phone', 'programme', 'origin', 'ski_level',
  'guests', 'roommate', 'accommodation', 'dietary', 'comments',
];

const json = (obj, status) =>
  new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json' },
  });

export async function onRequestPost({ request, env }) {
  let data;
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      data = await request.json();
    } else {
      data = Object.fromEntries(await request.formData());
    }
  } catch (err) {
    return json({ success: false, message: 'Could not read the submission.' }, 400);
  }

  // Honeypot: bots tick it, humans never see it. Accept silently so the bot
  // does not learn it was caught, but write nothing.
  if (data.botcheck) return json({ success: true, message: 'Thanks!' });

  const name = (data.name || '').trim();
  const email = (data.email || '').trim();
  if (!name || !email) {
    return json({ success: false, message: 'Name and email are required.' }, 400);
  }

  // The form field is still called `campus` for backwards compatibility.
  const row = {};
  FIELDS.forEach((f) => { row[f] = (data[f] || '').toString().trim() || null; });
  if (!row.programme) row.programme = (data.campus || '').toString().trim() || null;

  if (!env.DB) {
    return json({ success: false, message: 'Registration store is not configured.' }, 500);
  }

  try {
    await env.DB.prepare(
      `INSERT INTO registrations
         (name, email, phone, programme, origin, ski_level, guests, roommate,
          accommodation, dietary, comments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      name, email, row.phone, row.programme, row.origin, row.ski_level,
      row.guests, row.roommate, row.accommodation, row.dietary, row.comments
    ).run();
  } catch (err) {
    return json({ success: false, message: 'Could not save your registration. Please try again.' }, 500);
  }

  // Notification email — best effort, never blocks a saved registration.
  if (env.WEB3FORMS_KEY) {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: env.WEB3FORMS_KEY,
          subject: 'New IIMA Snow Trek 2027 registration',
          from_name: 'IIMA Snow Trek website',
          name, email,
          phone: row.phone, programme: row.programme, origin: row.origin,
          ski_level: row.ski_level, guests: row.guests, roommate: row.roommate,
          accommodation: row.accommodation, dietary: row.dietary, comments: row.comments,
        }),
      });
    } catch (err) {
      // Swallowed deliberately: the row is already saved.
    }
  }

  return json({ success: true, message: 'Registration received.' });
}

// A stray GET should not look like a broken page.
export const onRequestGet = () =>
  json({ success: false, message: 'POST a registration to this endpoint.' }, 405);

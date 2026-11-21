/* ===========================================================================
   IIMA Snow Trek — trip cost calculator

   Every constant below is sourced, not invented. Each price is stored in the
   currency it was quoted in and converted exactly once, at display time, by
   inrOf()/usdOf(). Nothing is pre-converted and stored, so a rate change is a
   one-line edit and no figure can drift out of step with another.

   All figures checked 21 November 2026 unless a comment says otherwise.
   Anything still unverified at that date is labelled as such here and on the
   page — see pricing.html for the reader-facing version of these notes.
   =========================================================================== */

var FX = {
  checked:    '21 November 2026',
  inrPerUsd:  92.97,   // RBI reference rate, 20 Nov 2026
  kztPerUsd:  455,     // National Bank of Kazakhstan, 21 Nov 2026
  inrPerGbp:  121.93,  // RBI reference rate, 20 Nov 2026
  inrPerSgd:  72.0     // 20 Nov 2026
};

var NIGHTS = 4;

/* Money is { amt, cur }. These build one. */
function kzt(n) { return { amt: n, cur: 'KZT' }; }
function usdM(n) { return { amt: n, cur: 'USD' }; }
function inrM(n) { return { amt: n, cur: 'INR' }; }
function gbp(n) { return { amt: n, cur: 'GBP' }; }
function sgd(n) { return { amt: n, cur: 'SGD' }; }

/* The single conversion point. Everything displayed passes through here. */
function inrOf(m) {
  switch (m.cur) {
    case 'INR': return m.amt;
    case 'USD': return m.amt * FX.inrPerUsd;
    case 'KZT': return m.amt * (FX.inrPerUsd / FX.kztPerUsd);
    case 'GBP': return m.amt * FX.inrPerGbp;
    case 'SGD': return m.amt * FX.inrPerSgd;
  }
  return 0;
}

/* Costing stance: these are low-end planning assumptions — the cheapest
   named, bookable option we could find for these exact dates, not an average
   and not a contracted group rate. They assume someone books early and books
   the specific property named. There is no percentile behind them: they are
   individual booking-site inventory on one day, 21 Nov 2026. */
var CONFIG = {

  /* --- Lift passes -------------------------------------------------------
     Shymbulak's 2026/27 season page (effective 19 Nov 2026) so far publishes
     ONLY the beginner "Under Low" rate: 8,000 KZT adult / 5,000 KZT child
     (6-14), flat across weekdays and weekends, limited to Bely Mishka,
     Ak Barsik and the lower Professor section. Under-6s free; pensioners free
     on weekdays.

     No full 2026/27 day-ticket tariff was found published on Shymbulak's
     season page as of 21 Nov 2026. The figures
     below are last season's (2025/26) rates — 9,000 KZT weekday, 12,000 KZT
     weekend, 3,000 KZT child — which the resort no longer displays. The
     calculator runs on that stated basis until 2026/27 day tickets are out.

     Our ski days are Sat 23, Sun 24 and Mon 25 Jan 2027: two weekend days
     then one weekday, in that order. */
  liftAdultKztByDay:  [12000, 12000, 9000],
  liftChildKztPerDay: 3000,
  liftBeginnerAdultKzt: 8000,   // published 2026/27 "Under Low", for reference
  liftBeginnerChildKzt: 5000,

  /* --- Gear hire ---------------------------------------------------------
     Free Life (free-life.kz) published winter price list for the 2026/27
     season (1 Nov 2026 - 31 Mar 2027). Ski set or snowboard set = board/skis,
     boots and poles. Renters must be 18+ and leave a document or deposit, so
     children's gear is taken out on an adult's name. Same Sat/Sun/Mon order
     as the lift passes. */
  rentalAdultKztByDay: [5000, 5000, 4000],
  rentalChildKztByDay: [3500, 3500, 2500],
  // The rest of the Free Life list, for the full-kit figure quoted on the page.
  rentalExtrasKzt: {
    helmetWeekday: 1500, helmetWeekend: 2000,
    jacket: 2500, trousers: 2500, gloves: 1000, goggles: 2000, balaclava: 500
  },

  /* --- Lesson ------------------------------------------------------------
     UNVERIFIED for the 2026/27 season: this is the half-day beginner group
     rate carried over from the earlier estimate and not re-confirmed on
     21 Nov 2026. Treated as a planning assumption, not a quoted price. */
  lessonUsd: 22,

  /* --- Transfers ---------------------------------------------------------
     AlaGo (ala-go.kz), prices valid from 17 Oct 2026. Both are STARTING
     prices per vehicle, not per seat.

     Mountain: Almaty <-> Shymbulak/Medeu round trip from 30,000 KZT per
     13-seat Toyota Hiace with driver. Thirteen fit travelling light;
     realistically 9-10 once ski gear is in. We split at 10.

     Airport: from 25,000 KZT per vehicle each way, up to 9 people with large
     suitcases. Counted both ways. */
  mountainVanKzt: 30000,
  mountainVanSeats: 10,
  airportVehicleKzt: 25000,
  airportVehicleSeats: 9,

  /* --- Our own numbers ---------------------------------------------------
     The four hosted meals/evenings and the on-ground coordination fee are
     organiser planning assumptions, not quoted rates. These are the levers we
     control directly. */
  hostedAdultUsd: 65,
  hostedChildUsd: 35,
  coordinatorAdultUsd: 30,
  coordinatorChildUsd: 15,

  /* --- Rooms -------------------------------------------------------------
     INDICATIVE OBSERVATIONS taken on 21 November 2026 for a 22-26 Jan 2027
     stay in Almaty city, from individual booking inventory. Not live rates,
     not guaranteed, not contracted group rates, and nothing here says a
     party of thirty could be accommodated. No star ratings are claimed:
     each room is named as the property listed it. The two-adult quotes are
     separate observations taken on 21 Nov 2026; they remain dated
     observations, not live or guaranteed rates, like everything else here.

     `occupancies` is keyed by the number of people the quote actually
     covers, and each entry is its own separately obtained quote. The same
     room priced for 1 adult and priced for 2 adults are two different
     observations, NOT one divided by the other: a sole-occupancy total is
     never halved to make a per-person figure. compute() picks the basis
     matching how many people end up in the room and says which it used.

     `atProperty` is charged on arrival on top of the booking total, so it
     is billed as its own line.

     CANCELLATION is reported exactly as observed and never generalised.
     Only four facts are confirmed: Astana (free until 20 Jan 2027, then a
     conditional partial refund per the rate's dated terms), Holiday Inn
     Express family (conditional partial refund, with a flexible variant),
     Best Western Atakent (free until 19 Jan 2027, 4pm hotel time) and the
     IC Pasha suite (conditional partial refund). Everything else —
     including Renion Hills and the cheapest InterContinental rates — is
     UNCONFIRMED. Empty refund tiers and no-show conditions do not settle
     cancellation, so they are not read as "non-refundable". */
  rooms: {
    dorm: {
      label: '4-bed hostel dorm', capacity: 1, perPerson: true,
      occupancies: {
        1: { total4Usd: 28, basis: 'per bed — top of the $21-28 band across the cheapest beds observed (Hostel Shanyraq, Sun Hostel, Botanical Hostel)',
             cancellation: 'varies by hostel — not checked' }
      }
    },

    econPrivate: {
      label: 'Private room — International Hotel Astana', capacity: 2,
      occupancies: {
        1: { total4Usd: 246.04, atPropertyKzt: 5022,
             basis: 'Twin Standard, 1 adult sole occupancy',
             cancellation: 'free until 20 Jan 2027 16:30 IST, then a conditional partial refund ($121.24) per the rate\'s dated terms' },
        2: { total4Usd: 261.18, atPropertyKzt: 5331.44,
             basis: 'Twin Standard with breakfast, 2 adults sharing (tax $25.07 included)',
             cancellation: 'free before 20 Jan 2027, then a conditional partial refund per the rate\'s dated terms' }
      }
    },

    luxPrivate: {
      label: 'Private room — InterContinental Almaty', capacity: 2,
      occupancies: {
        1: { total4Usd: 1088.15,
             basis: 'King Classic Accessible, room-only, 1 adult sole occupancy — a breakfast variant was $1,271.39 and a flexible room-only rate $1,200.34',
             cancellation: 'unconfirmed on this cheapest rate' },
        2: { total4Usd: 1088.15,
             basis: '2 Twin Classic, room-only, 2 adults sharing (tax $137.13 included, nothing due at the property) — a breakfast variant was $1,491.36',
             cancellation: 'unconfirmed on this cheapest rate' }
      }
    },

    familyEcon: {
      label: 'Family room — Holiday Inn Express Almaty', capacity: 4,
      occupancies: {
        4: { total4Usd: 587.04,
             basis: '2 adults + 2 illustrative children aged 8 and 6 — a flexible variant was $674.91',
             cancellation: 'not free-cancel — a conditional partial refund ($381.87 of $587.04) per the rate\'s dated terms; the $674.91 flexible variant refunds in full before 15 Jan' }
      }
    },

    familyLux: {
      label: 'Family suite — InterContinental Almaty', capacity: 4,
      occupancies: {
        4: { total4Usd: 6938.61,
             basis: 'Pasha suite, 2 adults + 2 illustrative children aged 8 and 6 — a breakfast variant was $7,308.16',
             cancellation: 'not free-cancel — a conditional partial refund ($4,522.65 of $6,938.61) per the rate\'s dated terms' }
      }
    }
  },

  /* --- Flights -----------------------------------------------------------
     All observations dated 21 Nov 2026, 1 adult, economy, round trip, taxes
     and fees included. Per person. Prices move; bag fees apply as noted.

     These are full round-trip SELECTIONS — outbound and return both chosen,
     with the booking-page total read — not headline teasers. Arrivals are
     matched to the itinerary where that is possible at all: the trip starts
     Friday 22 January, so a fare landing at 01:30 on the 23rd does not
     qualify and is recorded in `rejected` rather than quietly used. London
     is the exception and is handled honestly — see below.

     `status` is one of:
       verified    - booking-page total confirmed.
       unverified  - observed, but the price moved between reads and/or the
                     booking page rejected the combination. Never presented
                     as a confirmed fare.
     `bagsShort` sits next to the fare so a total can never read as an
     all-in cost. `advisory` raises an on-screen notice in the calculator. */
  flights: {
    none: { label: 'Booking my own / not counted', fare: null, status: 'none' },

    del: {
      label: 'Delhi (DEL)', fare: inrM(39120), status: 'verified',
      via: 'Air Astana nonstop both ways — out Fri 22 Jan 08:10 → ALA 11:15; back Tue 26 Jan 14:40 → DEL 18:55',
      bagsShort: 'Return checked bag extra',
      bags: 'Outbound carries 1 cabin bag + 2 free checked bags; on the return the first checked bag is chargeable (Air Astana / Air India codeshare mix)',
      booking: '₹39,120 through an OTA such as Booking.com; booking direct with Air Astana showed ₹41,320'
    },

    bom: {
      label: 'Mumbai (BOM)', fare: inrM(53375), status: 'verified',
      via: 'Out Air India + Air Astana, 1 stop via Delhi (2h55 layover), Fri 22 Jan 03:05 → ALA 11:15, 8h40 total. Back Air Astana nonstop, Tue 26 Jan 22:35 → BOM 04:05 next day, 5h',
      bagsShort: 'Checked bag extra',
      bags: '1 cabin bag; first checked bag chargeable',
      booking: '₹53,375 via BudgetAir; Expedia showed ₹56,637',
      rejected: 'A cheaper ₹52,350 Air Arabia option exists but lands at ALA 01:30 on 23 January, after the trip starts — excluded'
    },

    blr: {
      label: 'Bengaluru (BLR)', fare: null, status: 'pending',
      note: 'Fare unverified as of 21 Nov 2026 — no booking-verified fare was found in the routings we checked. Observations ran ₹56,600–₹67,000 depending on routing, and none of them could be booked: the Air Arabia same-day combos (₹56,614–₹56,802) were rejected at the booking step three times as no longer available, and the Air India + Air Astana routing via Delhi (BLR 00:15 → ALA 11:15 on 22 Jan; back ALA 14:40 on 26 Jan → BLR 00:25 on 27 Jan, listed ₹66,192–₹67,035) returns "We can\'t find booking options for this itinerary". Those figures are unverified observations only: they are excluded from every total here and from any cheapest-origin comparison.',
      rejected: 'The ₹55,087 headline fare lands at 01:30 on 23 January, after the trip starts — excluded on arrival time as well as price.'
    },

    sin: {
      label: 'Singapore (SIN)', fare: sgd(1221), status: 'verified',
      via: 'Out Thai AirAsia + Thai AirAsia X, SIN 11:00 → ALA 23:05 Fri 22 Jan, 1 stop, 5h25 at Bangkok DMK (self-transfer, separate tickets). Back AirAsia X + AirAsia, ALA 19:00 Tue 26 Jan → SIN 08:20 Wed 27 Jan, 1 stop, 1h05 at Kuala Lumpur (transfer type unverified)',
      bagsShort: 'Checked bag extra',
      bags: '1 free cabin bag; the first checked bag is chargeable on the whole trip',
      booking: 'S$1,221 via the Jettzy OTA; booking direct with AirAsia X was S$1,245 including a S$50 card fee',
      advisory: 'The OUTBOUND is a SELF-TRANSFER on separate tickets — 5h25 at Bangkok DMK — so if the first leg runs late, nobody is responsible for the onward flight. Buy travel insurance that covers missed connections. The transfer type on the return via Kuala Lumpur (1h05) is not stated in what we checked, so treat it as unverified rather than assuming either way.'
    },

    lhr: {
      label: 'London (LHR)', fare: gbp(315), status: 'verified',
      via: 'Pegasus throughout, "Light" fare. Out STN 12:55 Fri 22 Jan → ALA 04:40 Sat 23 Jan, 1 stop, 1h45 at Istanbul SAW. Back ALA 05:45 Tue 26 Jan → STN 14:35, 1 stop, 3h35 at SAW',
      bagsShort: 'Carry-on + checked bag extra',
      bags: 'On the Light fare both the cabin bag and the first checked bag are chargeable, with no changes and no refunds. The £358 Saver fare includes 1 free cabin bag and the first checked bag free; Comfort Flex at £400 is refundable',
      booking: '£315 is the lowest verified total; the fare class matters more than the headline here',
      advisory: 'Among the 22 January departures we searched, every option arrives early on the 23rd — including the £799 Air Astana nonstop. This one lands at 04:40 on Saturday 23 January, in time for the first ski day, but it needs a late-arrival or early-check-in arrangement with the hotel; holding the night of 22 January is what makes walking straight into a room on arrival possible, and that has to be arranged rather than assumed. Note the return too: departing 05:45 on 26 January means leaving for the airport in the middle of that night, so plan on no last-morning activity on the 26th.'
    }
  },

  /* --- Food & drink out of pocket ----------------------------------------
     Per adult for the whole trip, built from Numbeo Almaty, November 2026:
     inexpensive restaurant meal 6,000 KZT (range 3,000-8,500); three-course
     mid-range meal for two 20,000 KZT (15,000-40,000), so 10,000 per head;
     fast-food combo 4,000 KZT.

       4 lunches      light 4x3,000   standard 4x6,000    generous 4x8,500
       2 free dinners light 2x6,000   standard 2x10,000   generous 2x20,000
       snacks/coffee  10,000 flat  <- UNVERIFIED planning assumption: roughly
                                      half a 4,000 KZT combo a day across 5
                                      days. Not a sourced figure.

     Children eat at roughly 60% of an adult — also a planning assumption. */
  foodKzt: { light: 34000, standard: 54000, generous: 84000 },
  foodChildFactor: 0.6,

  /* --- Extras ------------------------------------------------------------
     Banya: UNVERIFIED. Arasan's official price page still exposes no readable
     rates (checked 21 Nov 2026), so the 10,000 KZT below is a carried-over
     planning assumption, not a published price.

     Medeu skating is gone, not forgotten: the rink is still closed for
     reconstruction. The deputy mayor's stated expectation is the 2027-28
     winter season and AlaGo's own page says closed until about 2027, so it
     cannot be offered on this trip at all. */
  banyaKzt: 10000
};

/* Fixed category order — never reordered, never cycled. Colours are slots 1-5
   of the validated categorical palette. */
var CATEGORIES = [
  { key: 'flights',  label: 'Flights',          color: '#2a78d6' },
  { key: 'stay',     label: 'Accommodation',    color: '#eb6834' },
  { key: 'mountain', label: 'On the mountain',  color: '#1baf7a' },
  { key: 'package',  label: 'Trip package',     color: '#eda100' },
  { key: 'extras',   label: 'Food & extras',    color: '#e87ba4' }
];

/* Presets deliberately carry no departure city: you pick that once from the
   chips at the top and it survives every archetype switch, so the comparison
   is like-for-like from wherever you're actually flying. */
var PRESETS = {
  'first-timer': {
    label: 'The Economic First-Time Skier',
    state: { adults: 1, children: 0, childrenSki: false, room: 'econPrivate', skiDays: 2,
             rental: true, lesson: true, food: 'light', banya: false }
  },
  'couple': {
    label: 'The Couple',
    state: { adults: 2, children: 0, childrenSki: false, room: 'econPrivate', skiDays: 2,
             rental: true, lesson: false, food: 'standard', banya: true }
  },
  'family': {
    label: 'The Family',
    state: { adults: 2, children: 2, childrenSki: true, room: 'familyEcon', skiDays: 2,
             rental: true, lesson: true, food: 'standard', banya: false }
  },
  'non-skier': {
    label: 'The Non-Skier',
    state: { adults: 1, children: 0, childrenSki: false, room: 'econPrivate', skiDays: 0,
             rental: false, lesson: false, food: 'standard', banya: true }
  },
  'luxury': {
    label: 'The Luxury Traveller',
    state: { adults: 1, children: 0, childrenSki: false, room: 'luxPrivate', skiDays: 3,
             rental: true, lesson: false, food: 'generous', banya: true }
  }
};

var state = JSON.parse(JSON.stringify(PRESETS['first-timer'].state));
state.origin = 'del';

/* --------------------------------------------------------------------------
   The model
   -------------------------------------------------------------------------- */

/* Sum the first `days` entries of a per-day rate table. Our ski days run
   Sat, Sun, Mon in that order, so taking 2 days means two weekend days and
   taking 3 adds the cheaper Monday. */
function sumDays(table, days) {
  var total = 0;
  for (var i = 0; i < days && i < table.length; i++) total += table[i];
  return total;
}

function liftKzt(days, isChild) {
  if (days <= 0) return 0;
  if (isChild) return CONFIG.liftChildKztPerDay * days;
  return sumDays(CONFIG.liftAdultKztByDay, days);
}

/* Pick the quote whose occupancy matches how many people are actually in
   the room. An exact match is used as-is; otherwise we fall back to the
   nearest basis at or below that headcount (else the smallest we hold) and
   flag the mismatch rather than pretending the price carries over. */
function pickOccupancy(room, occupants) {
  var keys = Object.keys(room.occupancies).map(Number).sort(function (a, b) { return a - b; });
  if (room.occupancies[occupants]) {
    return { q: room.occupancies[occupants], quotedFor: occupants, exact: true };
  }
  var below = keys.filter(function (k) { return k <= occupants; });
  var k = below.length ? below[below.length - 1] : keys[0];
  return { q: room.occupancies[k], quotedFor: k, exact: false };
}

function roomsNeeded(room, people) {
  if (room.perPerson) return people;          // a dorm bill is per bed
  return Math.max(1, Math.ceil(people / room.capacity));
}

/* Spell the lift-pass rule out rather than leaving "weekend days cost more"
   to be taken on trust: which days, at which published rate, and the fact
   that the rate is last season's because 2026/27 is not out yet. */
function liftRuleNote(days) {
  if (days <= 0) return '';
  var wkend = CONFIG.liftAdultKztByDay[0].toLocaleString('en-US');
  var wkday = CONFIG.liftAdultKztByDay[2].toLocaleString('en-US');
  var rule;
  if (days === 1) rule = 'Sat at the ' + wkend + ' KZT weekend day rate';
  else if (days === 2) rule = 'Sat + Sun, both weekend days at ' + wkend + ' KZT each';
  else rule = 'Sat + Sun at ' + wkend + ' KZT each, Mon at the ' + wkday + ' KZT weekday rate';
  return rule + ' — no 2026/27 full-mountain tariff found published on the checked ' +
    'source as of 21 Nov 2026; last-season (2025/26) rate shown';
}

/* The day names behind a ski-day count, for labels. */
function skiDayNames(days) {
  if (days <= 0) return 'none';
  if (days === 1) return 'Sat';
  if (days === 2) return 'Sat + Sun';
  return 'Sat, Sun + Mon';
}

function compute(s) {
  var adults = Math.max(1, s.adults);
  var children = Math.max(0, s.children);
  var people = adults + children;
  var room = CONFIG.rooms[s.room];
  var kidSkiDays = s.childrenSki ? s.skiDays : 0;

  var items = [];

  /* Each line is a single source currency, converted once here. Rupees are
     rounded per line and the dollar column is derived from the rounded rupee
     figure, so both columns add up to their headline totals exactly. */
  function add(category, label, money, note) {
    var amountInr = Math.round(inrOf(money));
    if (amountInr <= 0) return;
    items.push({
      category: category, label: label,
      amountInr: amountInr,
      amount: Math.round(amountInr / FX.inrPerUsd),
      note: note || ''
    });
  }

  // --- Flights -----------------------------------------------------------
  var origin = CONFIG.flights[s.origin];
  if (origin.fare) {
    add('flights', 'Return flights × ' + people,
        { amt: origin.fare.amt * people, cur: origin.fare.cur },
        rsM(origin.fare) + ' each from ' + origin.label +
        (origin.status === 'approx'
          ? ' — approximate, observed 21 Nov 2026, verification pending'
          : ' — verified round trip, observed 21 Nov 2026'));
  }

  // --- Accommodation -----------------------------------------------------
  var units = roomsNeeded(room, people);
  var occupants = room.perPerson ? 1 : Math.ceil(people / units);
  var pick = pickOccupancy(room, occupants);
  var q = pick.q;

  var stayNote = room.perPerson
    ? rsM(usdM(q.total4Usd)) + '/bed for ' + NIGHTS + ' nights × ' + units + ' beds'
    : rsM(usdM(q.total4Usd)) + ' for ' + NIGHTS + ' nights × ' + units + ' room' + (units > 1 ? 's' : '');
  stayNote += ' — ' + q.basis + '. Indicative, observed 21 Nov 2026';
  if (!pick.exact) {
    stayNote += '. Quoted for ' + pick.quotedFor + ' in the room, you have ' + occupants +
      ' — a rate for this party is not yet confirmed';
  }
  // A party that does not fill every room to the quoted occupancy is being
  // priced on rooms it only partly fills, so say so rather than letting the
  // figure read as an exact quote for this group.
  if (!room.perPerson && people !== occupants * units) {
    stayNote += ' — priced as ' + units + ' room' + (units > 1 ? 's' : '') + ' at the ' +
      pick.quotedFor + '-person rate; your party splits unevenly across them and a rate ' +
      'for this exact mix is not confirmed';
  }
  add('stay', room.label + ', ' + NIGHTS + ' nights', usdM(q.total4Usd * units), stayNote);

  if (q.atPropertyKzt) {
    add('stay', 'Payable at the property', kzt(q.atPropertyKzt * units),
        q.atPropertyKzt.toLocaleString('en-US', { maximumFractionDigits: 2 }) +
        ' KZT per room, charged on arrival — not in the booking total above');
  }

  // --- On the mountain ---------------------------------------------------
  add('mountain', 'Lift passes, adults',
      kzt(liftKzt(s.skiDays, false) * adults),
      '× ' + adults + ' — ' + liftRuleNote(s.skiDays));
  add('mountain', 'Lift passes, children',
      kzt(liftKzt(kidSkiDays, true) * children),
      skiDayNames(kidSkiDays) + ' × ' + children + ' at the ' +
      CONFIG.liftChildKztPerDay.toLocaleString('en-US') + ' KZT child day rate (ages 6–14) — ' +
      'no 2026/27 full-mountain tariff found published on the checked source as of ' +
      '21 Nov 2026; last-season (2025/26) rate shown');

  if (s.rental) {
    var adultRental = sumDays(CONFIG.rentalAdultKztByDay, s.skiDays) * adults;
    var childRental = sumDays(CONFIG.rentalChildKztByDay, kidSkiDays) * children;
    add('mountain', 'Ski / snowboard hire', kzt(adultRental + childRental),
        'Free Life 2026/27 list, ' + skiDayNames(s.skiDays) + ' — weekend days cost more');
  }
  if (s.lesson && s.skiDays > 0) {
    var learners = adults + (s.childrenSki ? children : 0);
    add('mountain', 'Beginner group lesson', usdM(CONFIG.lessonUsd * learners),
        'One session × ' + learners + ' — rate unverified for 2026/27');
  }
  var mtnPeople = adults + (s.childrenSki ? children : 0);
  add('mountain', 'Transfers to Shymbulak',
      kzt((CONFIG.mountainVanKzt / CONFIG.mountainVanSeats) * s.skiDays * mtnPeople),
      'From ' + CONFIG.mountainVanKzt.toLocaleString('en-US') + ' KZT per 13-seat van, split ' +
      CONFIG.mountainVanSeats + ' ways with gear — ' + s.skiDays + ' ski day' + (s.skiDays === 1 ? '' : 's'));

  // --- Trip package ------------------------------------------------------
  add('package', 'Airport transfers',
      kzt((CONFIG.airportVehicleKzt / CONFIG.airportVehicleSeats) * 2 * people),
      'From ' + CONFIG.airportVehicleKzt.toLocaleString('en-US') + ' KZT per vehicle each way, split ' +
      CONFIG.airportVehicleSeats + ' ways, both directions');
  add('package', 'The 4 hosted meals & evenings',
      usdM(CONFIG.hostedAdultUsd * adults + CONFIG.hostedChildUsd * children),
      rsM(usdM(CONFIG.hostedAdultUsd)) + '/adult, ' + rsM(usdM(CONFIG.hostedChildUsd)) +
      '/child — our own figure, not a quote');
  add('package', 'Coordination & contingency',
      usdM(CONFIG.coordinatorAdultUsd * adults + CONFIG.coordinatorChildUsd * children),
      'On-ground organiser fee — our own figure, not a quote');

  // --- Food & extras -----------------------------------------------------
  var foodAdult = CONFIG.foodKzt[s.food];
  var foodChild = foodAdult * CONFIG.foodChildFactor;
  add('extras', 'Food & drink not in the package',
      kzt(foodAdult * adults + foodChild * children),
      'Lunches, 2 unhosted dinners, snacks — ' + rsM(kzt(foodAdult)) + '/adult, from Numbeo Almaty Nov 2026');
  if (s.banya) add('extras', 'Banya session', kzt(CONFIG.banyaKzt * adults),
      rsM(kzt(CONFIG.banyaKzt)) + ' × ' + adults + ' adult' + (adults === 1 ? '' : 's') + ' — price unverified');

  var total = items.reduce(function (sum, i) { return sum + i.amount; }, 0);
  var totalInr = items.reduce(function (sum, i) { return sum + i.amountInr; }, 0);

  var byCategory = CATEGORIES.map(function (c) {
    var rows = items.filter(function (i) { return i.category === c.key; });
    var amount = rows.reduce(function (sum, i) { return sum + i.amount; }, 0);
    var amountInr = rows.reduce(function (sum, i) { return sum + i.amountInr; }, 0);
    return { key: c.key, label: c.label, color: c.color, amount: amount, amountInr: amountInr,
             share: totalInr > 0 ? amountInr / totalInr : 0 };
  }).filter(function (c) { return c.amountInr > 0; });

  return { items: items, byCategory: byCategory, total: total, totalInr: totalInr,
           people: people, adults: adults, children: children,
           flightStatus: origin.status, flightAdvisory: origin.advisory || '',
           flightNote: origin.note || '' };
}

/* --------------------------------------------------------------------------
   Rendering
   -------------------------------------------------------------------------- */

function inr(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function usd(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
/* Quote any money object in rupees. Hoisted, so compute() can use it. */
function rsM(m) { return inr(inrOf(m)); }

function render() {
  var r = compute(state);

  // A held origin contributes no airfare at all, so the total below is a
  // land-only figure. Never let that pass silently.
  var notice = document.getElementById('calc-notice');
  if (notice) {
    var msgs = [];
    if (r.flightStatus === 'pending') {
      msgs.push('<strong>No airfare is included in this total.</strong> ' + r.flightNote);
    }
    if (r.flightStatus === 'unverified') {
      msgs.push('<strong>The airfare in this total is not confirmed.</strong> It was observed on ' +
        '21 November 2026, the price was unstable across reads, and the booking page would not hold ' +
        'the combination — treat it as a placeholder, not a quote.');
    }
    if (r.flightAdvisory) msgs.push(r.flightAdvisory);
    notice.innerHTML = msgs.join('<br><br>');
    notice.hidden = msgs.length === 0;
  }

  // With no airfare in the figure it is a subtotal, not a total. Say so in
  // the header as well as the banner — the header is what gets screenshotted.
  var head = document.getElementById('calc-total-head');
  if (head) {
    if (r.flightStatus === 'pending') {
      head.textContent = 'Estimated subtotal — airfare not included (no confirmed ' +
        CONFIG.flights[state.origin].label.replace(/ \(.*\)$/, '') + ' fare)';
    } else if (r.flightStatus === 'none') {
      head.textContent = 'Estimated subtotal — airfare not included (you are booking your own)';
    } else {
      head.textContent = 'Estimated total for your party';
    }
  }

  document.getElementById('calc-total').textContent = inr(r.totalInr);
  document.getElementById('calc-total-inr').textContent =
    '≈ ' + usd(r.total) + ' for the whole party';
  document.getElementById('calc-per-head').textContent =
    inr(r.totalInr / r.people) + ' per person across ' + r.people +
    (r.people === 1 ? ' traveller' : ' travellers');

  // Stacked composition bar: 2px surface gaps, rounded outer ends.
  var bar = document.getElementById('calc-bar');
  bar.innerHTML = '';
  r.byCategory.forEach(function (c) {
    var seg = document.createElement('div');
    seg.className = 'stack-seg';
    seg.style.flexGrow = String(c.share);
    seg.style.background = c.color;
    seg.setAttribute('tabindex', '0');
    seg.setAttribute('role', 'img');
    seg.setAttribute('aria-label', c.label + ': ' + inr(c.amountInr) + ', ' + Math.round(c.share * 100) + '% of the total');
    seg.addEventListener('mouseenter', function (e) { showTip(e, c); });
    seg.addEventListener('focus', function (e) { showTip(e, c); });
    seg.addEventListener('mouseleave', hideTip);
    seg.addEventListener('blur', hideTip);
    bar.appendChild(seg);
  });

  var legend = document.getElementById('calc-legend');
  legend.innerHTML = '';
  r.byCategory.forEach(function (c) {
    var li = document.createElement('li');
    li.innerHTML = '<span class="sw" style="background:' + c.color + '"></span>' +
      '<span class="lg-label">' + c.label + '</span>' +
      '<span class="lg-val">' + inr(c.amountInr) + ' · ' + Math.round(c.share * 100) + '%</span>';
    legend.appendChild(li);
  });

  var tbody = document.getElementById('calc-rows');
  tbody.innerHTML = '';
  CATEGORIES.forEach(function (cat) {
    var rows = r.items.filter(function (i) { return i.category === cat.key; });
    if (!rows.length) return;
    rows.forEach(function (item, idx) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td class="cat-cell">' + (idx === 0
          ? '<span class="sw" style="background:' + cat.color + '"></span>' + cat.label
          : '') + '</td>' +
        '<td><strong>' + item.label + '</strong>' +
          (item.note ? '<span class="row-note">' + item.note + '</span>' : '') + '</td>' +
        '<td class="amt">' + inr(item.amountInr) +
          '<span class="amt-sub">' + usd(item.amount) + '</span></td>';
      tbody.appendChild(tr);
    });
  });
}

var tip;
function showTip(e, c) {
  hideTip();
  tip = document.createElement('div');
  tip.className = 'calc-tip';
  tip.innerHTML = '<strong>' + c.label + '</strong>' + inr(c.amountInr) +
    ' · ' + Math.round(c.share * 100) + '% of total';
  document.body.appendChild(tip);
  var rect = e.target.getBoundingClientRect();
  tip.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
  tip.style.top = (rect.top + window.scrollY - tip.offsetHeight - 10) + 'px';
}
function hideTip() { if (tip && tip.parentNode) { tip.parentNode.removeChild(tip); } tip = null; }

/* --------------------------------------------------------------------------
   Wiring
   -------------------------------------------------------------------------- */

function syncControls() {
  document.getElementById('c-adults').value = state.adults;
  document.getElementById('c-children').value = state.children;
  document.getElementById('c-children-ski').checked = state.childrenSki;
  document.getElementById('c-room').value = state.room;
  document.getElementById('c-ski-days').value = state.skiDays;
  document.getElementById('c-ski-days-out').textContent =
    state.skiDays === 0 ? 'none' : state.skiDays + ' of 3 · ' + skiDayNames(state.skiDays);
  document.getElementById('c-rental').checked = state.rental;
  document.getElementById('c-lesson').checked = state.lesson;
  document.getElementById('c-food').value = state.food;
  document.getElementById('c-banya').checked = state.banya;
  document.getElementById('c-children-ski').disabled = state.children === 0;
  // Nothing on the mountain is billed on a zero-ski-day trip, the lesson
  // included — grey the controls that would have no effect.
  document.getElementById('c-rental').disabled = state.skiDays === 0;
  document.getElementById('c-lesson').disabled = state.skiDays === 0;
  document.querySelectorAll('.origin-btn').forEach(function (b) {
    b.classList.toggle('active', b.getAttribute('data-origin') === state.origin);
  });
}

function initCalculator() {
  if (!document.getElementById('calc')) return;

  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var p = PRESETS[btn.getAttribute('data-preset')];
      var origin = state.origin;           // your departure city outlives the preset
      state = JSON.parse(JSON.stringify(p.state));
      state.origin = origin;
      document.querySelectorAll('.preset-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      syncControls();
      render();
    });
  });

  document.querySelectorAll('.origin-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.origin = btn.getAttribute('data-origin');
      syncControls();
      render();
    });
  });

  function bind(id, key, cast) {
    var el = document.getElementById(id);
    el.addEventListener('input', function () {
      state[key] = cast(el.type === 'checkbox' ? el.checked : el.value);
      // Once the numbers are hand-edited they're no longer a preset.
      document.querySelectorAll('.preset-btn').forEach(function (b) { b.classList.remove('active'); });
      syncControls();
      render();
    });
  }
  var num = function (v) { return parseInt(v, 10) || 0; };
  var same = function (v) { return v; };
  var bool = function (v) { return !!v; };

  bind('c-adults', 'adults', num);
  bind('c-children', 'children', num);
  bind('c-children-ski', 'childrenSki', bool);
  bind('c-room', 'room', same);
  bind('c-ski-days', 'skiDays', num);
  bind('c-rental', 'rental', bool);
  bind('c-lesson', 'lesson', bool);
  bind('c-food', 'food', same);
  bind('c-banya', 'banya', bool);

  syncControls();
  render();
}

document.addEventListener('DOMContentLoaded', initCalculator);

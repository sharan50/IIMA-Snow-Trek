/* ===========================================================================
   IIMA Snow Trek — trip cost calculator

   Every constant below is sourced, not invented. Where a figure comes from a
   published rate it is noted; where it is a planning assumption set by the
   organiser (our own fees) it is labelled as such. See pricing.html for the
   on-page version of these notes.
   =========================================================================== */

var KZT_PER_USD = 470;
/* Component costs are sourced in USD and KZT, so rupees are a conversion.
   ~94.8 was the rate on 8 Sep 2026 (US Federal Reserve H.10), which ranged
   94.36-95.22 that week; 95 is the round figure used throughout the site.
   Worth revisiting before the balance is collected. */
var INR_PER_USD = 95;
var NIGHTS = 4;

/* Costing stance: every figure below sits at roughly the 25th percentile of
   what we found on the market, not the midpoint. In plain terms these are
   book-early, shop-around numbers — achievable, but they assume someone
   actually does the shopping. A late booker should expect the upper half of
   the ranges published elsewhere on this page. The two exceptions are lift
   passes and the published ticket prices for the banya and Medeu: those are
   fixed rates, so there is no percentile to pick. */
var CONFIG = {
  // Shymbulak published day-pass rates, 2025/26 season: 9,000 KZT weekday,
  // 12,000 KZT weekend, 3,000 KZT for children 6-10. Our ski days fall on
  // Sat 23rd (weekend), Sun 24th (weekend) and Tue 26th (weekday). The New
  // Year surcharge window (25 Dec - 11 Jan) has closed by our dates.
  // Fixed published price — not discounted.
  liftAdultByDay: [26, 26, 19],
  liftChildPerDay: 6,

  // Hiring in Almaty city rather than on the mountain: ~5,000 KZT/day against
  // 7,000 KZT for the same basic set at the resort.
  rentalPerDay: 11,

  // Half-day group lesson for first-timers, booked as a group.
  lessonPerPerson: 22,

  // Shared van up to the mountain and back, split across the group.
  mountainTransferPerDay: 9,

  // Return airport transfers, shared. A car runs ~8,000 KZT and seats 3-4.
  airportTransfer: 12,

  // The four hosted meals/evenings. Organiser assumption, not a quoted rate —
  // this is the lever we control most directly.
  hostedAdult: 65,
  hostedChild: 35,

  // On-ground coordination and contingency. Organiser's own fee.
  coordinatorAdult: 30,
  coordinatorChild: 15,

  // Per room per night, except the dorm which is per bed. Capacity is what the
  // room actually sleeps — the calculator books extra rooms when the party
  // outgrows one.
  rooms: {
    dorm:          { label: '4-bed hostel dorm',        rate: 9,   capacity: 1, perPerson: true },
    econPrivate:   { label: 'Private room, 2-3★',  rate: 38,  capacity: 2 },
    luxPrivate:    { label: 'Private room, 5★',    rate: 285, capacity: 2 },
    familyEcon:    { label: 'Family room, economy',     rate: 105, capacity: 4 },
    familyLux:     { label: 'Family suite, luxury',     rate: 350, capacity: 4 }
  },

  // Round-trip economy at the 25th percentile of the ranges on this page.
  // Children are charged as adults — child fare discounts on these routes are
  // small and vary by airline.
  flights: {
    none: { label: 'Booking my own / not counted', fare: 0 },
    del:  { label: 'Delhi (DEL)',       fare: 365 },
    bom:  { label: 'Mumbai (BOM)',      fare: 355 },
    blr:  { label: 'Bengaluru (BLR)',   fare: 390 },
    sin:  { label: 'Singapore (SIN)',   fare: 515 },
    lhr:  { label: 'London (LHR)',      fare: 480 }
  },

  // Out-of-pocket food and drink for the whole trip, per adult. Children eat
  // at roughly 60% of an adult.
  food: { light: 80, standard: 110, generous: 145 },
  foodChildFactor: 0.6,

  // Optional extras. Banya 10,000 KZT a visit; Medeu is 1,800 KZT entry plus
  // 1,000 KZT skate hire for an adult, 400 + 500 for a child.
  banya: 21,
  skatingAdult: 6,
  skatingChild: 2
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
             rental: true, lesson: true, food: 'light', banya: false, skating: false }
  },
  'couple': {
    label: 'The Couple',
    state: { adults: 2, children: 0, childrenSki: false, room: 'econPrivate', skiDays: 2,
             rental: true, lesson: false, food: 'standard', banya: true, skating: true }
  },
  'family': {
    label: 'The Family',
    state: { adults: 2, children: 2, childrenSki: true, room: 'familyEcon', skiDays: 2,
             rental: true, lesson: true, food: 'standard', banya: false, skating: true }
  },
  'non-skier': {
    label: 'The Non-Skier',
    state: { adults: 1, children: 0, childrenSki: false, room: 'econPrivate', skiDays: 0,
             rental: false, lesson: false, food: 'standard', banya: true, skating: true }
  },
  'luxury': {
    label: 'The Luxury Traveller',
    state: { adults: 1, children: 0, childrenSki: false, room: 'luxPrivate', skiDays: 3,
             rental: true, lesson: false, food: 'generous', banya: true, skating: true }
  }
};

var state = JSON.parse(JSON.stringify(PRESETS['first-timer'].state));
state.origin = 'del';

/* --------------------------------------------------------------------------
   The model
   -------------------------------------------------------------------------- */

function liftCost(days, isChild) {
  if (days <= 0) return 0;
  if (isChild) return CONFIG.liftChildPerDay * days;
  var total = 0;
  for (var i = 0; i < days && i < CONFIG.liftAdultByDay.length; i++) {
    total += CONFIG.liftAdultByDay[i];
  }
  return total;
}

function roomsNeeded(room, people) {
  if (room.perPerson) return people;          // a dorm bill is per bed
  return Math.max(1, Math.ceil(people / room.capacity));
}

function compute(s) {
  var adults = Math.max(1, s.adults);
  var children = Math.max(0, s.children);
  var people = adults + children;
  var room = CONFIG.rooms[s.room];
  var kidSkiDays = s.childrenSki ? s.skiDays : 0;

  var items = [];
  function add(category, label, amount, note) {
    // Rupees are rounded per line and the totals are summed from those rounded
    // lines, so the breakdown always adds up to the headline figure exactly.
    if (amount > 0) items.push({
      category: category, label: label, amount: amount,
      amountInr: Math.round(amount * INR_PER_USD), note: note || ''
    });
  }

  // --- Flights -----------------------------------------------------------
  var fare = CONFIG.flights[s.origin].fare;
  if (fare > 0) {
    add('flights', 'Return flights × ' + people, fare * people,
        rs(fare) + ' each from ' + CONFIG.flights[s.origin].label);
  }

  // --- Accommodation -----------------------------------------------------
  var units = roomsNeeded(room, people);
  var stayTotal = room.rate * units * NIGHTS;
  var stayNote = room.perPerson
    ? rs(room.rate) + '/bed/night × ' + units + ' × ' + NIGHTS + ' nights'
    : rs(room.rate) + '/night × ' + units + ' room' + (units > 1 ? 's' : '') + ' × ' + NIGHTS + ' nights';
  add('stay', room.label + ', ' + NIGHTS + ' nights', stayTotal, stayNote);

  // --- On the mountain ---------------------------------------------------
  var liftAdults = liftCost(s.skiDays, false) * adults;
  var liftKids = liftCost(kidSkiDays, true) * children;
  add('mountain', 'Lift passes, adults', liftAdults,
      s.skiDays + ' day' + (s.skiDays === 1 ? '' : 's') + ' × ' + adults + ' — weekend days cost more');
  add('mountain', 'Lift passes, children', liftKids,
      kidSkiDays + ' day' + (kidSkiDays === 1 ? '' : 's') + ' × ' + children + ' at the 6-10 child rate');

  if (s.rental) {
    var skiers = adults + (s.childrenSki ? children : 0);
    var rentalDays = s.skiDays;
    add('mountain', 'Ski / snowboard hire', CONFIG.rentalPerDay * rentalDays * skiers,
        rs(CONFIG.rentalPerDay) + '/day × ' + rentalDays + ' × ' + skiers + ' skier' + (skiers === 1 ? '' : 's'));
  }
  if (s.lesson) {
    var learners = adults + (s.childrenSki ? children : 0);
    add('mountain', 'Beginner group lesson', CONFIG.lessonPerPerson * learners,
        'One session × ' + learners);
  }
  var mtnTransferPeople = adults + (s.childrenSki ? children : 0);
  add('mountain', 'Transfers to Shymbulak', CONFIG.mountainTransferPerDay * s.skiDays * mtnTransferPeople,
      'Shared shuttle, ' + s.skiDays + ' ski day' + (s.skiDays === 1 ? '' : 's'));

  // --- Trip package ------------------------------------------------------
  add('package', 'Airport transfers', CONFIG.airportTransfer * people, 'Return, shared shuttle');
  add('package', 'The 4 hosted meals & evenings',
      CONFIG.hostedAdult * adults + CONFIG.hostedChild * children,
      rs(CONFIG.hostedAdult) + '/adult, ' + rs(CONFIG.hostedChild) + '/child');
  add('package', 'Coordination & contingency',
      CONFIG.coordinatorAdult * adults + CONFIG.coordinatorChild * children,
      'On-ground organiser fee');

  // --- Food & extras -----------------------------------------------------
  var foodAdult = CONFIG.food[s.food];
  var foodChild = Math.round(foodAdult * CONFIG.foodChildFactor);
  add('extras', 'Food & drink not in the package',
      foodAdult * adults + foodChild * children,
      'Lunches, 2 unhosted dinners, snacks — ' + rs(foodAdult) + '/adult');
  if (s.banya) add('extras', 'Banya session', CONFIG.banya * adults, rs(CONFIG.banya) + ' × ' + adults + ' adults');
  if (s.skating) add('extras', 'Skating at Medeu',
      CONFIG.skatingAdult * adults + CONFIG.skatingChild * children, 'Entry plus skate hire');

  var total = items.reduce(function (sum, i) { return sum + i.amount; }, 0);
  var totalInr = items.reduce(function (sum, i) { return sum + i.amountInr; }, 0);

  var byCategory = CATEGORIES.map(function (c) {
    var rows = items.filter(function (i) { return i.category === c.key; });
    var amount = rows.reduce(function (sum, i) { return sum + i.amount; }, 0);
    var amountInr = rows.reduce(function (sum, i) { return sum + i.amountInr; }, 0);
    return { key: c.key, label: c.label, color: c.color, amount: amount, amountInr: amountInr,
             share: total > 0 ? amount / total : 0 };
  }).filter(function (c) { return c.amount > 0; });

  return { items: items, byCategory: byCategory, total: total, totalInr: totalInr,
           people: people, adults: adults, children: children };
}

/* --------------------------------------------------------------------------
   Rendering
   -------------------------------------------------------------------------- */

function inr(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function usd(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
/* Component costs are held in USD; notes quote them in rupees to match the
   rest of the page. Hoisted, so compute() can use it. */
function rs(usdAmount) { return inr(usdAmount * INR_PER_USD); }

function render() {
  var r = compute(state);

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
    state.skiDays === 0 ? 'none' : state.skiDays + ' of 3';
  document.getElementById('c-rental').checked = state.rental;
  document.getElementById('c-lesson').checked = state.lesson;
  document.getElementById('c-food').value = state.food;
  document.getElementById('c-banya').checked = state.banya;
  document.getElementById('c-skating').checked = state.skating;
  document.getElementById('c-children-ski').disabled = state.children === 0;
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
  bind('c-skating', 'skating', bool);

  syncControls();
  render();
}

document.addEventListener('DOMContentLoaded', initCalculator);

// IIMA Snow Trek — shared behaviour

document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // Highlight active nav link based on current page
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Tabs (Activities page)
  var tabButtons = document.querySelectorAll('.tab-btn');
  if (tabButtons.length) {
    tabButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-panel').forEach(function (p) { p.classList.remove('active'); });
        btn.classList.add('active');
        document.getElementById(target).classList.add('active');
      });
    });
  }

  // FAQ accordion
  document.querySelectorAll('.accordion-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.accordion-item');
      var wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(function (i) {
        i.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Registration form -> Web3Forms, with an inline success state.
  // Only ever show the confirmation when the endpoint actually accepted the
  // submission: a failed post that still renders "You're on the list!" loses
  // someone's registration without either side knowing.
  var form = document.getElementById('rsvp-form');
  if (form) {
    var submitBtn = form.querySelector('button[type="submit"]');

    var fail = function (msg) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Registration'; }
      alert(msg + '\n\nPlease email p24dhruv@iima.ac.in directly so your spot is not lost.');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var key = (form.querySelector('[name="access_key"]') || {}).value || '';
      if (key.indexOf('PASTE-YOUR') === 0) {
        alert('This form is not connected yet — the site owner still needs to add the Web3Forms access key.\n\nPlease email p24dhruv@iima.ac.in to register in the meantime.');
        return;
      }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; })
            .then(function (body) { return { ok: res.ok, body: body }; });
        })
        .then(function (r) {
          if (!r.ok || r.body.success === false) {
            fail('Sorry — your registration could not be submitted' +
                 (r.body.message ? ' (' + r.body.message + ')' : '') + '.');
            return;
          }
          form.style.display = 'none';
          document.getElementById('form-success').style.display = 'block';
        })
        .catch(function () {
          fail('Sorry — your registration could not be submitted. You may be offline.');
        });
    });
  }
});

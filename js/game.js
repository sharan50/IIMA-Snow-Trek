/* Fall Line — the ski simulator embed.
 *
 * The game is a single self-contained HTML file vendored into this site at
 * /simulator/, so the frame is same-origin: nothing here depends on another
 * host staying up or on that host's framing policy. The site sends
 * X-Frame-Options: DENY globally, which would block even this; _headers
 * detaches it for /simulator/* and allows frame-ancestors 'self' instead.
 *
 * Still click-to-load rather than framed on arrival: the game starts a
 * 180 Hz physics loop, a canvas render loop and a Web Audio synth, and
 * nobody who merely lands on the page should pay for that.
 *
 * The game reads the keyboard from its own document, so the frame has to
 * hold focus for anything to happen — hence the focus() on load and the
 * line on the page telling people to click it once.
 */

var GAME_URL = 'simulator/';

document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('game-load');
  if (!btn) return;

  var frame = document.getElementById('game-frame');
  var placeholder = document.getElementById('game-placeholder');

  btn.addEventListener('click', function () {
    btn.disabled = true;
    btn.textContent = 'Loading…';

    var iframe = document.createElement('iframe');
    iframe.src = GAME_URL;
    iframe.title = 'Fall Line — ski simulator';
    iframe.className = 'game-iframe';
    iframe.setAttribute('allow', 'fullscreen; gamepad; autoplay');
    iframe.setAttribute('allowfullscreen', '');

    iframe.addEventListener('load', function () {
      if (placeholder) placeholder.remove();
      // Same origin, so this hands the game the keyboard without the user
      // having to find the canvas and click it first.
      try { iframe.contentWindow.focus(); } catch (e) { /* not fatal */ }
      iframe.focus();
    });

    frame.appendChild(iframe);

    // Same-origin and ~120 KB, so this should never fire. If it does, the
    // deploy is missing /simulator/ — say so rather than leaving a spinner.
    setTimeout(function () {
      if (!placeholder || !placeholder.isConnected) return;
      btn.disabled = false;
      btn.textContent = 'Try again';
      var alt = placeholder.querySelector('.game-ph-alt');
      if (alt) {
        alt.innerHTML = 'Still not loading — ' +
          '<a href="' + GAME_URL + '" target="_blank" rel="noopener">open it in a new tab ↗</a>';
        alt.classList.add('is-warning');
      }
    }, 9000);
  });
});

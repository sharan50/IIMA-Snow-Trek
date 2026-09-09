/* Fall Line — the ski simulator on /game.html.
 *
 * The markup is a screenshot wrapped in a link to the game, so with no
 * JavaScript — or if anything here breaks — clicking the picture still gets
 * you to the game. That is the baseline, and it cannot fail.
 *
 * What this file adds is the inline version. The game is vendored into this
 * site at /simulator/, so the frame is same-origin: nothing depends on
 * another host staying up or on that host's framing policy. The site sends
 * X-Frame-Options: DENY globally, which would block even this; _headers
 * detaches it for /simulator/* and allows frame-ancestors 'self' instead.
 *
 * It stays click-to-load rather than framed on arrival: the game starts a
 * 180 Hz physics loop, a canvas render loop and a Web Audio synth, and
 * nobody who merely lands on the page should pay for that.
 *
 * The game reads the keyboard from its own document, so the frame has to
 * hold focus for anything to happen — hence the focus() on load and the
 * line on the page telling people to click it once.
 */

var GAME_URL = 'simulator/';

document.addEventListener('DOMContentLoaded', function () {
  var poster = document.getElementById('game-poster');
  if (!poster) return;

  var frame = document.getElementById('game-frame');

  poster.addEventListener('click', function (ev) {
    // Leave ctrl/cmd/shift/middle clicks alone: someone asking for a new tab
    // should get one, and the href already points at the game.
    if (ev.defaultPrevented || ev.button !== 0) return;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;

    ev.preventDefault();
    poster.classList.add('is-loading');

    var iframe = document.createElement('iframe');
    iframe.src = GAME_URL;
    iframe.title = 'Fall Line — ski simulator';
    iframe.className = 'game-iframe';
    iframe.setAttribute('allow', 'fullscreen; gamepad; autoplay');
    iframe.setAttribute('allowfullscreen', '');

    iframe.addEventListener('load', function () {
      poster.remove();
      // Same origin, so this hands the game the keyboard without the user
      // having to find the canvas and click it first.
      try { iframe.contentWindow.focus(); } catch (e) { /* not fatal */ }
      iframe.focus();
    });

    frame.appendChild(iframe);

    // Same-origin and ~120 KB, so this should never fire. If it does, the
    // deploy is missing /simulator/ — put the poster back rather than
    // leaving a dead frame, since its link still goes to the game.
    setTimeout(function () {
      if (!poster.isConnected) return;
      poster.classList.remove('is-loading');
      var btn = poster.querySelector('.game-ph-btn');
      if (btn) btn.textContent = 'Open the game ↗';
    }, 9000);
  });
});

/* Ski simulator embed.
 *
 * Click-to-load rather than an iframe on page load: the game is a separate
 * site, so this avoids pulling it down for everyone who merely lands on the
 * page, and means no third-party request is made until someone asks for one.
 *
 * A cross-origin frame cannot be inspected, and a page blocked by
 * X-Frame-Options still fires `load` on the iframe element — so there is no
 * reliable way to detect a blank frame from here. Instead of guessing, the
 * escape hatch is permanent: an "open in a new tab" link stays visible
 * whatever happens, so a blocked embed is an inconvenience rather than a
 * dead end.
 */

var GAME_URL = 'https://skiing-game.netlify.app';

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
    iframe.title = 'Ski simulator';
    iframe.className = 'game-iframe';
    iframe.setAttribute('allow', 'fullscreen; gamepad; accelerometer');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'eager');

    iframe.addEventListener('load', function () {
      if (placeholder) placeholder.remove();
      var hint = document.getElementById('game-hint');
      if (hint) hint.hidden = false;
    });

    frame.appendChild(iframe);

    // If it has not even fired `load` after a while, something is wrong at the
    // network level — surface the direct link rather than leaving a spinner.
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

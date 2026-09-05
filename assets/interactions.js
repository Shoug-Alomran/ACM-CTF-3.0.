/* CTF 3.0 shared runtime bootstrap.
 * Keeps the original site runtime intact while routing every registration CTA
 * to the canonical ACM-backed registration page.
 */
(function () {
  'use strict';

  function installRegistrationRoute() {
    document.querySelectorAll('.site-header__cta').forEach(function (link) {
      link.setAttribute('href', 'register.html');
    });

    document.addEventListener('click', function (event) {
      var target = event.target.closest('[data-register], a[href$="#register"], .site-header__cta');
      if (!target) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = 'register.html';
    }, true);
  }

  var core = document.createElement('script');
  core.src = 'assets/interactions-core.js?v=20260905-3';
  core.async = false;
  core.onload = function () {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', installRegistrationRoute, { once: true });
    } else {
      installRegistrationRoute();
    }
  };
  document.head.appendChild(core);
}());

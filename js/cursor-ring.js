/**
 * Custom Cursor - Theme-colored ring that follows the mouse
 * - Default arrow cursor stays, ring is decorative overlay
 * - Ring enlarges on hovering links/buttons
 * - Color syncs with --pe-accent (theme switcher)
 * - Hidden on touch devices
 */
(function () {
  'use strict';

  // Skip touch devices
  if ('ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches) return;

  var ring = document.createElement('div');
  ring.id = 'pe-cursor-ring';
  document.body.appendChild(ring);

  var mx = -100, my = -100; // off-screen initially
  var rx = -100, ry = -100;
  var raf;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    if (ring.style.opacity === '0') ring.style.opacity = '';
  });

  document.addEventListener('mouseleave', function () {
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    ring.style.opacity = '';
  });

  // Smooth follow with lerp
  function animate() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    raf = requestAnimationFrame(animate);
  }
  raf = requestAnimationFrame(animate);

  // Enlarge on interactive elements
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest('a, button, [role="button"], input, textarea, select, .pagination-item, label');
    if (el) ring.classList.add('pe-cursor-hover');
  });
  document.addEventListener('mouseout', function (e) {
    var el = e.target.closest('a, button, [role="button"], input, textarea, select, .pagination-item, label');
    if (el) ring.classList.remove('pe-cursor-hover');
  });

  // Pause when tab hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else { raf = requestAnimationFrame(animate); }
  });
})();

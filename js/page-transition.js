/**
 * Page Transition v3
 * - Uses CSS class for animation (more reliable than inline style)
 * - Longer duration + bigger movement to be clearly visible
 */
(function () {
  'use strict';

  // Inject CSS animation
  var style = document.createElement('style');
  style.textContent = [
    '@keyframes pe-page-in {',
    '  from { opacity: 0; transform: translateY(40px); }',
    '  to { opacity: 1; transform: translateY(0); }',
    '}',
    '.pe-page-enter {',
    '  animation: pe-page-in 600ms ease-out both;',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  document.addEventListener('pjax:complete', function () {
    var wrap = document.getElementById('body-wrap');
    if (!wrap) return;

    // Remove class first (in case of rapid navigation)
    wrap.classList.remove('pe-page-enter');
    // Force reflow to restart animation
    void wrap.offsetHeight;
    // Add class to trigger animation
    wrap.classList.add('pe-page-enter');

    // Clean up after animation
    setTimeout(function () {
      wrap.classList.remove('pe-page-enter');
    }, 650);
  });
})();

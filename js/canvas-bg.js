/**
 * Dynamic Canvas Background v8
 * - Does NOT replace #pe-base-layer (theme-switcher's gradient div stays)
 * - Adds a SEPARATE transparent canvas on top for animated light blobs only
 */
(function () {
  'use strict';

  var canvas, ctx, w, h, blobs, raf;
  var initialized = false;

  function createBlobs() {
    var arr = [];
    for (var i = 0; i < 10; i++) {
      var size = Math.max(w, h);
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: size * (0.06 + Math.random() * 0.08),
        dx: (Math.random() - 0.5) * 2.5,
        dy: (Math.random() - 0.5) * 2.5,
      });
    }
    return arr;
  }

  function draw() {
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    if (!blobs) return;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    for (var i = 0; i < blobs.length; i++) {
      var b = blobs[i];
      // Solid white circle like the test that worked, but softer
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(150,150,200,0.2)' : 'rgba(255,255,255,0.45)';
      ctx.fill();

      b.x += b.dx;
      b.y += b.dy;
      if (b.x - b.radius < -w * 0.1) b.dx = Math.abs(b.dx);
      if (b.x + b.radius > w * 1.1) b.dx = -Math.abs(b.dx);
      if (b.y - b.radius < -h * 0.1) b.dy = Math.abs(b.dy);
      if (b.y + b.radius > h * 1.1) b.dy = -Math.abs(b.dy);
    }
  }

  var lastFrame = 0;
  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (ts - lastFrame < 33) return;
    lastFrame = ts;
    draw();
  }

  function init() {
    if (initialized) return;

    canvas = document.createElement('canvas');
    canvas.id = 'pe-canvas-blobs';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
    ctx = canvas.getContext('2d');
    document.body.insertBefore(canvas, document.body.firstChild);

    w = window.innerWidth;
    h = window.innerHeight;
    blobs = createBlobs();

    window.addEventListener('resize', function () {
      w = window.innerWidth;
      h = window.innerHeight;
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
      else { if (!raf) { lastFrame = 0; raf = requestAnimationFrame(loop); } }
    });

    // Rebuild blobs when dark/light mode changes
    var observer = new MutationObserver(function () {
      blobs = createBlobs();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    raf = requestAnimationFrame(loop);
    initialized = true;
  }

  window.__canvasBgUpdate = function () { blobs = createBlobs(); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 600); });
  } else { setTimeout(init, 600); }
})();

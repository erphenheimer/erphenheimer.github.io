/**
 * APlayer Enhancement v3
 * - Whole player (bar + playlist) draggable as one unit
 * - Built-in lyrics hidden; single floating lyrics panel
 * - Lyrics: single line for Chinese-only, two lines for bilingual (original + translation)
 * - Lyrics panel resizable
 * - Edge-hide with hold-to-activate buffer
 */
(function () {
  'use strict';

  var RETRY_MS = 600;
  var MAX_RETRY = 25;
  var retryCount = 0;
  var initialized = false;

  function init() {
    if (initialized) return;
    var root = document.querySelector('.aplayer.aplayer-fixed');
    if (!root) { if (++retryCount < MAX_RETRY) setTimeout(init, RETRY_MS); return; }
    var body = root.querySelector('.aplayer-body');
    if (!body) { if (++retryCount < MAX_RETRY) setTimeout(init, RETRY_MS); return; }
    initialized = true;

    // ===== 1. Inject CSS overrides =====
    injectStyles();

    // ===== 2. Fix positioning: make body follow container =====
    // APlayer fixed mode sets .aplayer-body to position:fixed independently.
    // Override it so body sits inside the container flow.
    root.classList.add('pe-root');

    var state = loadState();
    root.style.setProperty('--pe-x', state.x + 'px');
    root.style.setProperty('--pe-y', state.y + 'px');

    // ===== 3. Hide built-in lyrics =====
    var builtinLrc = root.querySelector('.aplayer-lrc');
    if (builtinLrc) builtinLrc.style.display = 'none';

    // ===== 4. Setup features =====
    setupDrag(root, state);
    setupControls(root, state);
    setupLrcPanel(root, state);
  }

  // ==================== CSS ====================
  function injectStyles() {
    var s = document.createElement('style');
    s.id = 'pe-styles';
    if (document.getElementById('pe-styles')) return;
    s.textContent = [
      // Override container positioning
      '.aplayer.aplayer-fixed.pe-root {',
      '  position: fixed !important;',
      '  left: var(--pe-x, 0px) !important;',
      '  top: var(--pe-y, auto) !important;',
      '  bottom: auto !important;',
      '  right: auto !important;',
      '  z-index: 9999 !important;',
      '}',
      // CRITICAL: override .aplayer-body from position:fixed to relative
      '.aplayer.aplayer-fixed.pe-root .aplayer-body {',
      '  position: relative !important;',
      '  left: auto !important;',
      '  bottom: auto !important;',
      '  right: auto !important;',
      '  top: auto !important;',
      '  width: 100% !important;',
      '}',
      // Hide built-in lrc
      '.aplayer.aplayer-fixed.pe-root .aplayer-lrc { display: none !important; }',
      // Smooth transitions for hide/show
      '.pe-root.pe-anim {',
      '  transition: transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.5s !important;',
      '}',
      // Drag handle
      '.pe-handle {',
      '  position: absolute; top: -26px; left: 50%; transform: translateX(-50%);',
      '  width: 44px; height: 24px; background: var(--btn-bg,#6C63FF); color: #fff;',
      '  border-radius: 8px 8px 0 0; text-align: center; font-size: 14px;',
      '  line-height: 24px; cursor: grab; user-select: none;',
      '  opacity: 0; transition: opacity .2s; z-index: 10;',
      '}',
      '.pe-root:hover .pe-handle { opacity: 0.8; }',
      '.pe-handle:hover { opacity: 1 !important; }',
      '.pe-handle.pe-grabbing { cursor: grabbing; }',
      // Control panel
      '.pe-panel {',
      '  position: absolute; top: -26px; right: 0; display: flex; gap: 3px; z-index: 10;',
      '  opacity: 0; transition: opacity .2s;',
      '}',
      '.pe-root:hover .pe-panel { opacity: 1; }',
      '.pe-btn {',
      '  height: 24px; min-width: 26px; border: none; background: var(--btn-bg,#6C63FF);',
      '  color: #fff; border-radius: 6px 6px 0 0; font-size: 12px; cursor: pointer;',
      '  padding: 0 6px; line-height: 24px; transition: background .2s; white-space: nowrap;',
      '}',
      '.pe-btn:hover { background: var(--btn-hover-bg,#FF6584); }',
      // Floating lyrics panel
      '.pe-lrc {',
      '  position: fixed; z-index: 10000;',
      '  background: rgba(0,0,0,0.6); backdrop-filter: blur(12px);',
      '  border-radius: 10px; padding: 10px 18px; color: #fff;',
      '  text-align: center; cursor: grab; user-select: none;',
      '  min-width: 180px; min-height: 30px;',
      '  resize: both; overflow: hidden;',
      '  box-shadow: 0 4px 20px rgba(0,0,0,0.3);',
      '  font-size: 15px; line-height: 1.6;',
      '}',
      '.pe-lrc.pe-dragging { cursor: grabbing; }',
      '.pe-lrc-line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }',
      '.pe-lrc-orig { font-size: 15px; opacity: 1; }',
      '.pe-lrc-trans { font-size: 13px; opacity: 0.75; margin-top: 2px; }',
    ].join('\n');
    document.head.appendChild(s);
  }

  // ==================== Drag whole player ====================
  function setupDrag(root, state) {
    var handle = document.createElement('div');
    handle.className = 'pe-handle';
    handle.innerHTML = '&#9776;';
    handle.title = '拖拽移动播放器';
    root.appendChild(handle);

    var dragging = false, offX = 0, offY = 0;

    function start(cx, cy) {
      dragging = true;
      handle.classList.add('pe-grabbing');
      var r = root.getBoundingClientRect();
      offX = cx - r.left; offY = cy - r.top;
    }
    function move(cx, cy) {
      if (!dragging) return;
      var x = cx - offX, y = cy - offY;
      var maxX = window.innerWidth - root.offsetWidth;
      var maxY = window.innerHeight - root.offsetHeight;
      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));
      root.style.setProperty('--pe-x', x + 'px');
      root.style.setProperty('--pe-y', y + 'px');
      if (root.classList.contains('pe-hidden')) cancelHide();
    }
    function end() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('pe-grabbing');
      document.removeEventListener('mousemove', onMM);
      document.removeEventListener('mouseup', onMU);
      document.removeEventListener('touchmove', onTM);
      document.removeEventListener('touchend', onTE);
      state.x = parseInt(root.style.getPropertyValue('--pe-x')) || 0;
      state.y = parseInt(root.style.getPropertyValue('--pe-y')) || 0;
      saveState(state);
    }

    function onMM(e) { move(e.clientX, e.clientY); }
    function onMU() { end(); }
    function onTM(e) { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }
    function onTE() { end(); }

    handle.addEventListener('mousedown', function (e) {
      e.preventDefault(); e.stopPropagation();
      start(e.clientX, e.clientY);
      document.addEventListener('mousemove', onMM);
      document.addEventListener('mouseup', onMU);
    });
    handle.addEventListener('touchstart', function (e) {
      e.preventDefault();
      start(e.touches[0].clientX, e.touches[0].clientY);
      document.addEventListener('touchmove', onTM, { passive: false });
      document.addEventListener('touchend', onTE);
    }, { passive: false });
  }

  // ==================== Controls (hide button) ====================
  function setupControls(root, state) {
    var panel = document.createElement('div');
    panel.className = 'pe-panel';
    var isHidden = false, hiddenSide = null, downTime = 0;

    var hideBtn = mkBtn('藏', '按住200ms隐藏到边缘');
    hideBtn.addEventListener('mousedown', function () { downTime = Date.now(); });
    hideBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isHidden) { cancelHide(); return; }
      if (Date.now() - downTime < 200) {
        hideBtn.style.background = '#FF6584';
        setTimeout(function () { hideBtn.style.background = ''; }, 300);
        return;
      }
      doHide();
    });

    function doHide() {
      var rect = root.getBoundingClientRect();
      var d = {
        left: rect.left + rect.width / 2,
        right: window.innerWidth - rect.right + rect.width / 2,
        bottom: window.innerHeight - rect.bottom + rect.height / 2
      };
      var near = 'bottom', min = Infinity;
      for (var k in d) { if (d[k] < min) { min = d[k]; near = k; } }
      hiddenSide = near; isHidden = true;
      root.classList.add('pe-anim');
      if (near === 'left') root.style.transform = 'translateX(-88%)';
      else if (near === 'right') root.style.transform = 'translateX(88%)';
      else root.style.transform = 'translateY(88%)';
      root.style.opacity = '0.25';
      root.classList.add('pe-hidden');
      hideBtn.textContent = '显'; hideBtn.title = '点击显示';
      setTimeout(function () { root.classList.remove('pe-anim'); }, 550);
      root.addEventListener('mouseenter', peekIn);
      root.addEventListener('mouseleave', peekOut);
    }
    function peekIn() {
      if (!isHidden) return;
      root.classList.add('pe-anim');
      root.style.transform = 'none'; root.style.opacity = '0.92';
      setTimeout(function () { root.classList.remove('pe-anim'); }, 550);
    }
    function peekOut() {
      if (!isHidden) return;
      root.classList.add('pe-anim');
      if (hiddenSide === 'left') root.style.transform = 'translateX(-88%)';
      else if (hiddenSide === 'right') root.style.transform = 'translateX(88%)';
      else root.style.transform = 'translateY(88%)';
      root.style.opacity = '0.25';
      setTimeout(function () { root.classList.remove('pe-anim'); }, 550);
    }

    window.__peCancelHide = function () {
      if (!isHidden) return;
      isHidden = false; hiddenSide = null;
      root.classList.add('pe-anim');
      root.style.transform = 'none'; root.style.opacity = '1';
      root.classList.remove('pe-hidden');
      hideBtn.textContent = '藏'; hideBtn.title = '按住200ms隐藏到边缘';
      root.removeEventListener('mouseenter', peekIn);
      root.removeEventListener('mouseleave', peekOut);
      setTimeout(function () { root.classList.remove('pe-anim'); }, 550);
    };

    panel.appendChild(hideBtn);
    root.appendChild(panel);
    // Store panel ref for lrc button insertion
    root.__pePanel = panel;
  }

  function cancelHide() { if (window.__peCancelHide) window.__peCancelHide(); }

  // ==================== Floating lyrics panel ====================
  function setupLrcPanel(root, state) {
    // Remove any leftover panels from previous init (PJAX)
    document.querySelectorAll('.pe-lrc').forEach(function (el) { el.remove(); });

    var lrcSource = root.querySelector('.aplayer-lrc');

    var box = document.createElement('div');
    box.className = 'pe-lrc';
    box.style.left = (state.lrcX || 100) + 'px';
    box.style.top = (state.lrcY || 100) + 'px';
    if (state.lrcW) box.style.width = state.lrcW + 'px';
    if (state.lrcH) box.style.height = state.lrcH + 'px';
    box.style.display = state.lrcVisible === false ? 'none' : 'block';
    document.body.appendChild(box);

    var lineOrig = document.createElement('div');
    lineOrig.className = 'pe-lrc-line pe-lrc-orig';
    box.appendChild(lineOrig);

    var lineTrans = document.createElement('div');
    lineTrans.className = 'pe-lrc-line pe-lrc-trans';
    lineTrans.style.display = 'none';
    box.appendChild(lineTrans);

    // --- Poll lyrics from APlayer's built-in lrc ---
    setInterval(function () {
      if (!lrcSource) {
        lrcSource = root.querySelector('.aplayer-lrc');
        if (!lrcSource) return;
      }
      var cur = lrcSource.querySelector('.aplayer-lrc-current');
      if (!cur) return;
      var raw = cur.textContent.trim();
      if (!raw) return;

      // Detect bilingual: "original / translation" or "original（translation）"
      var parts = parseBilingual(raw);
      if (parts) {
        lineOrig.textContent = parts.orig;
        lineTrans.textContent = parts.trans;
        lineTrans.style.display = 'block';
      } else {
        lineOrig.textContent = raw;
        lineTrans.style.display = 'none';
      }
    }, 250);

    // --- Toggle button ---
    var panel = root.__pePanel;
    if (panel) {
      var lrcBtn = mkBtn('词', '显示/隐藏歌词');
      lrcBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var vis = box.style.display !== 'none';
        box.style.display = vis ? 'none' : 'block';
        state.lrcVisible = !vis;
        saveState(state);
      });
      panel.insertBefore(lrcBtn, panel.firstChild);
    }

    // --- Drag lyrics panel ---
    var dragging = false, offX = 0, offY = 0;
    box.addEventListener('mousedown', function (e) {
      // Don't drag if user is resizing (bottom-right corner)
      var rect = box.getBoundingClientRect();
      if (e.clientX > rect.right - 16 && e.clientY > rect.bottom - 16) return;
      e.preventDefault(); dragging = true; box.classList.add('pe-dragging');
      offX = e.clientX - rect.left; offY = e.clientY - rect.top;
      document.addEventListener('mousemove', onMM);
      document.addEventListener('mouseup', onMU);
    });
    box.addEventListener('touchstart', function (e) {
      e.preventDefault(); dragging = true;
      var t = e.touches[0], rect = box.getBoundingClientRect();
      offX = t.clientX - rect.left; offY = t.clientY - rect.top;
      document.addEventListener('touchmove', onTM, { passive: false });
      document.addEventListener('touchend', onTE);
    }, { passive: false });

    function onMM(e) { if (dragging) moveLrc(e.clientX - offX, e.clientY - offY); }
    function onTM(e) { if (!dragging) return; e.preventDefault(); moveLrc(e.touches[0].clientX - offX, e.touches[0].clientY - offY); }
    function moveLrc(x, y) {
      x = Math.max(0, Math.min(x, window.innerWidth - box.offsetWidth));
      y = Math.max(0, Math.min(y, window.innerHeight - box.offsetHeight));
      box.style.left = x + 'px'; box.style.top = y + 'px';
    }
    function onMU() { endLrc(); }
    function onTE() { document.removeEventListener('touchmove', onTM); document.removeEventListener('touchend', onTE); endLrc(); }
    function endLrc() {
      dragging = false; box.classList.remove('pe-dragging');
      document.removeEventListener('mousemove', onMM);
      document.removeEventListener('mouseup', onMU);
      state.lrcX = parseInt(box.style.left) || 100;
      state.lrcY = parseInt(box.style.top) || 100;
      saveState(state);
    }

    // --- Save size on resize ---
    var resizeObs = new ResizeObserver(function () {
      state.lrcW = box.offsetWidth;
      state.lrcH = box.offsetHeight;
      saveState(state);
    });
    resizeObs.observe(box);
  }

  // ==================== Bilingual lyrics parser ====================
  function parseBilingual(text) {
    // Pattern 1: "original / translation" (slash separator)
    var slashMatch = text.match(/^(.+?)\s*[\/|]\s*(.+)$/);
    if (slashMatch) {
      var a = slashMatch[1].trim(), b = slashMatch[2].trim();
      if (a && b && a !== b) {
        // Determine which is Chinese
        if (isChinese(b) && !isChinese(a)) return { orig: a, trans: b };
        if (isChinese(a) && !isChinese(b)) return { orig: b, trans: a };
        return { orig: a, trans: b };
      }
    }
    // Pattern 2: "original（translation）" or "original (translation)"
    var bracketMatch = text.match(/^(.+?)\s*[（(](.+?)[）)]$/);
    if (bracketMatch) {
      var c = bracketMatch[1].trim(), d = bracketMatch[2].trim();
      if (c && d) {
        if (isChinese(d) && !isChinese(c)) return { orig: c, trans: d };
        return { orig: c, trans: d };
      }
    }
    return null;
  }

  function isChinese(str) {
    var count = 0;
    for (var i = 0; i < str.length && i < 20; i++) {
      var code = str.charCodeAt(i);
      if (code >= 0x4E00 && code <= 0x9FFF) count++;
    }
    return count >= 2;
  }

  // ==================== Helpers ====================
  function mkBtn(text, title) {
    var b = document.createElement('button');
    b.className = 'pe-btn'; b.textContent = text; b.title = title;
    return b;
  }

  function saveState(s) {
    try { localStorage.setItem('pe-state', JSON.stringify(s)); } catch (e) {}
  }
  function loadState() {
    try {
      var s = JSON.parse(localStorage.getItem('pe-state'));
      if (s && typeof s.x === 'number') return s;
    } catch (e) {}
    return { x: 0, y: window.innerHeight - 80, lrcVisible: true, lrcX: 100, lrcY: 100 };
  }

  // ==================== Bootstrap ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 1000); });
  } else {
    setTimeout(init, 1000);
  }
  document.addEventListener('pjax:complete', function () {
    retryCount = 0; initialized = false;
    setTimeout(init, 1000);
  });
})();

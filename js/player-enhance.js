/**
 * APlayer Enhancement v4
 * - Long-press player body to drag (no external handle/blank area)
 * - Edge-snap: when dragged near edge, show prompt to hide into edge
 * - Built-in lyrics hidden; single floating lyrics panel
 * - Lyrics: single line for Chinese-only, two lines for bilingual
 * - Lyrics panel resizable
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

    injectStyles();
    root.classList.add('pe-root');

    var state = loadState();
    root.style.setProperty('--pe-x', state.x + 'px');
    root.style.setProperty('--pe-y', state.y + 'px');

    // Hide built-in lyrics
    var builtinLrc = root.querySelector('.aplayer-lrc');
    if (builtinLrc) builtinLrc.style.display = 'none';

    setupDrag(root, body, state);
    setupLrcPanel(root, state);
  }

  // ==================== CSS ====================
  function injectStyles() {
    if (document.getElementById('pe-styles')) return;
    var s = document.createElement('style');
    s.id = 'pe-styles';
    s.textContent = [
      '.aplayer.aplayer-fixed.pe-root {',
      '  position: fixed !important;',
      '  left: var(--pe-x, 0px) !important;',
      '  top: var(--pe-y, auto) !important;',
      '  bottom: auto !important;',
      '  right: auto !important;',
      '  z-index: 9999 !important;',
      '}',
      '.aplayer.aplayer-fixed.pe-root .aplayer-body {',
      '  position: relative !important;',
      '  left: auto !important; bottom: auto !important;',
      '  right: auto !important; top: auto !important;',
      '  width: 100% !important;',
      '}',
      '.aplayer.aplayer-fixed.pe-root .aplayer-lrc { display: none !important; }',
      // Hide playlist area when folded (removes white blank)
      '.aplayer.aplayer-fixed.pe-root .aplayer-list.aplayer-list-hide {',
      '  display: none !important;',
      '}',
      '.pe-root.pe-anim {',
      '  transition: transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.5s !important;',
      '}',
      // Edge snap prompt
      '.pe-edge-prompt {',
      '  position: fixed; z-index: 10001; background: rgba(0,0,0,0.75);',
      '  color: #fff; padding: 6px 16px; border-radius: 8px; font-size: 13px;',
      '  pointer-events: auto; display: none; white-space: nowrap;',
      '  backdrop-filter: blur(8px); box-shadow: 0 4px 16px rgba(0,0,0,0.3);',
      '}',
      '.pe-edge-prompt button {',
      '  background: #6C63FF; border: none; color: #fff; padding: 3px 12px;',
      '  border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 8px;',
      '}',
      '.pe-edge-prompt button:hover { background: #FF6584; }',
      '.pe-edge-prompt button.pe-cancel-btn { background: #666; }',
      '.pe-edge-prompt button.pe-cancel-btn:hover { background: #888; }',
      // Lyrics button on player
      '.pe-lrc-toggle {',
      '  position: absolute; top: -22px; right: 0;',
      '  height: 20px; min-width: 24px; border: none;',
      '  background: var(--btn-bg,#6C63FF); color: #fff;',
      '  border-radius: 5px 5px 0 0; font-size: 11px;',
      '  cursor: pointer; padding: 0 6px; line-height: 20px;',
      '  opacity: 0; transition: opacity .2s;',
      '}',
      '.pe-root:hover .pe-lrc-toggle { opacity: 0.85; }',
      '.pe-lrc-toggle:hover { opacity: 1 !important; background: var(--btn-hover-bg,#FF6584); }',
      // Floating lyrics
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

  // ==================== Drag (long-press on player body) ====================
  function setupDrag(root, body, state) {
    var dragging = false, offX = 0, offY = 0;
    var longPressTimer = null;
    var isLongPress = false;
    var LONG_PRESS_MS = 100;

    var isHidden = false, hiddenSide = null;
    var EDGE_THRESHOLD = 30;

    // Edge prompt element
    var prompt = document.createElement('div');
    prompt.className = 'pe-edge-prompt';
    prompt.innerHTML = '收起到边缘？ <button class="pe-yes-btn">收起</button><button class="pe-cancel-btn">取消</button>';
    document.body.appendChild(prompt);

    prompt.querySelector('.pe-yes-btn').addEventListener('click', function () {
      prompt.style.display = 'none';
      doHide();
    });
    prompt.querySelector('.pe-cancel-btn').addEventListener('click', function () {
      prompt.style.display = 'none';
    });

    // Long-press to start drag on the player body
    body.addEventListener('mousedown', function (e) {
      // Don't intercept clicks on buttons/controls
      if (e.target.closest('button, .aplayer-icon, .aplayer-bar-wrap, .aplayer-volume-wrap, .aplayer-list, a, input')) return;
      var startX = e.clientX, startY = e.clientY;
      isLongPress = false;
      longPressTimer = setTimeout(function () {
        isLongPress = true;
        startDrag(startX, startY);
      }, LONG_PRESS_MS);

      function onEarlyMove(ev) {
        if (Math.abs(ev.clientX - startX) > 5 || Math.abs(ev.clientY - startY) > 5) {
          clearTimeout(longPressTimer);
          document.removeEventListener('mousemove', onEarlyMove);
          document.removeEventListener('mouseup', onEarlyUp);
        }
      }
      function onEarlyUp() {
        clearTimeout(longPressTimer);
        document.removeEventListener('mousemove', onEarlyMove);
        document.removeEventListener('mouseup', onEarlyUp);
      }
      document.addEventListener('mousemove', onEarlyMove);
      document.addEventListener('mouseup', onEarlyUp);
    });

    body.addEventListener('touchstart', function (e) {
      if (e.target.closest('button, .aplayer-icon, .aplayer-bar-wrap, .aplayer-volume-wrap, .aplayer-list, a, input')) return;
      var t = e.touches[0];
      var startX = t.clientX, startY = t.clientY;
      isLongPress = false;
      longPressTimer = setTimeout(function () {
        isLongPress = true;
        startDrag(startX, startY);
      }, LONG_PRESS_MS);

      function onEarlyMove(ev) {
        var t2 = ev.touches[0];
        if (Math.abs(t2.clientX - startX) > 5 || Math.abs(t2.clientY - startY) > 5) {
          clearTimeout(longPressTimer);
          document.removeEventListener('touchmove', onEarlyMove);
          document.removeEventListener('touchend', onEarlyUp);
        }
      }
      function onEarlyUp() {
        clearTimeout(longPressTimer);
        document.removeEventListener('touchmove', onEarlyMove);
        document.removeEventListener('touchend', onEarlyUp);
      }
      document.addEventListener('touchmove', onEarlyMove, { passive: true });
      document.addEventListener('touchend', onEarlyUp);
    }, { passive: true });

    function startDrag(cx, cy) {
      dragging = true;
      body.style.cursor = 'grabbing';
      var r = root.getBoundingClientRect();
      offX = cx - r.left; offY = cy - r.top;
      // If was hidden, un-hide first
      if (isHidden) cancelHideState();
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    }

    function onMove(e) { if (dragging) move(e.clientX, e.clientY); }
    function onTouchMove(e) { if (!dragging) return; e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }

    function move(cx, cy) {
      var x = cx - offX, y = cy - offY;
      var maxX = window.innerWidth - root.offsetWidth;
      var maxY = window.innerHeight - root.offsetHeight;
      x = Math.max(-10, Math.min(x, maxX + 10));
      y = Math.max(-10, Math.min(y, maxY + 10));
      root.style.setProperty('--pe-x', x + 'px');
      root.style.setProperty('--pe-y', y + 'px');
    }

    function onUp() { endDrag(); }
    function onTouchEnd() { endDrag(); }

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      body.style.cursor = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);

      state.x = parseInt(root.style.getPropertyValue('--pe-x')) || 0;
      state.y = parseInt(root.style.getPropertyValue('--pe-y')) || 0;
      saveState(state);

      // Check if near edge -> show prompt
      checkEdge();
    }

    function checkEdge() {
      var rect = root.getBoundingClientRect();
      var nearLeft = rect.left < EDGE_THRESHOLD;
      var nearRight = rect.right > window.innerWidth - EDGE_THRESHOLD;
      var nearBottom = rect.bottom > window.innerHeight - EDGE_THRESHOLD;

      if (nearLeft || nearRight || nearBottom) {
        // Show prompt near the player
        prompt.style.display = 'block';
        prompt.style.left = Math.min(rect.left, window.innerWidth - 220) + 'px';
        prompt.style.top = Math.max(0, rect.top - 36) + 'px';
        // Auto-dismiss after 3s
        setTimeout(function () { prompt.style.display = 'none'; }, 3000);
      }
    }

    function doHide() {
      var rect = root.getBoundingClientRect();
      var nearLeft = rect.left < EDGE_THRESHOLD;
      var nearRight = rect.right > window.innerWidth - EDGE_THRESHOLD;

      if (nearLeft) hiddenSide = 'left';
      else if (nearRight) hiddenSide = 'right';
      else hiddenSide = 'bottom';

      isHidden = true;
      root.classList.add('pe-anim');
      if (hiddenSide === 'left') root.style.transform = 'translateX(-88%)';
      else if (hiddenSide === 'right') root.style.transform = 'translateX(88%)';
      else root.style.transform = 'translateY(88%)';
      root.style.opacity = '0.25';
      root.classList.add('pe-hidden');
      setTimeout(function () { root.classList.remove('pe-anim'); }, 550);
      root.addEventListener('mouseenter', peekIn);
      root.addEventListener('mouseleave', peekOut);
      root.addEventListener('click', clickRestore);
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
    function clickRestore() {
      if (!isHidden) return;
      cancelHideState();
    }
    function cancelHideState() {
      isHidden = false; hiddenSide = null;
      root.classList.add('pe-anim');
      root.style.transform = 'none'; root.style.opacity = '1';
      root.classList.remove('pe-hidden');
      root.removeEventListener('mouseenter', peekIn);
      root.removeEventListener('mouseleave', peekOut);
      root.removeEventListener('click', clickRestore);
      setTimeout(function () { root.classList.remove('pe-anim'); }, 550);
    }
  }

  // ==================== Floating lyrics ====================
  function setupLrcPanel(root, state) {
    document.querySelectorAll('.pe-lrc').forEach(function (el) { el.remove(); });

    var lrcSource = root.querySelector('.aplayer-lrc');

    // Toggle button (small, on top of player)
    var lrcBtn = document.createElement('button');
    lrcBtn.className = 'pe-lrc-toggle';
    lrcBtn.textContent = '词';
    lrcBtn.title = '显示/隐藏歌词';
    root.appendChild(lrcBtn);

    // Lyrics box
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

    // Toggle
    lrcBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var vis = box.style.display !== 'none';
      box.style.display = vis ? 'none' : 'block';
      state.lrcVisible = !vis;
      saveState(state);
    });

    // Poll lyrics
    setInterval(function () {
      if (!lrcSource) { lrcSource = root.querySelector('.aplayer-lrc'); if (!lrcSource) return; }
      var cur = lrcSource.querySelector('.aplayer-lrc-current');
      if (!cur) return;
      var raw = cur.textContent.trim();
      if (!raw) { lineOrig.textContent = ''; lineTrans.style.display = 'none'; return; }

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

    // Drag lyrics
    var dragging = false, offX = 0, offY = 0;
    box.addEventListener('mousedown', function (e) {
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
      document.removeEventListener('mousemove', onMM); document.removeEventListener('mouseup', onMU);
      state.lrcX = parseInt(box.style.left) || 100;
      state.lrcY = parseInt(box.style.top) || 100;
      saveState(state);
    }

    var resizeObs = new ResizeObserver(function () {
      state.lrcW = box.offsetWidth; state.lrcH = box.offsetHeight;
      saveState(state);
    });
    resizeObs.observe(box);
  }

  // ==================== Bilingual parser ====================
  function parseBilingual(text) {
    var m = text.match(/^(.+?)\s*[\/|]\s*(.+)$/);
    if (m) { var a = m[1].trim(), b = m[2].trim(); if (a && b && a !== b) { if (isChinese(b) && !isChinese(a)) return {orig:a, trans:b}; if (isChinese(a) && !isChinese(b)) return {orig:b, trans:a}; return {orig:a, trans:b}; } }
    var m2 = text.match(/^(.+?)\s*[（(](.+?)[）)]$/);
    if (m2) { var c = m2[1].trim(), d = m2[2].trim(); if (c && d) return {orig:c, trans:d}; }
    return null;
  }
  function isChinese(str) { var n=0; for (var i=0;i<str.length&&i<20;i++) { var c=str.charCodeAt(i); if(c>=0x4E00&&c<=0x9FFF) n++; } return n>=2; }

  // ==================== Helpers ====================
  function saveState(s) { try { localStorage.setItem('pe-state', JSON.stringify(s)); } catch(e){} }
  function loadState() {
    try { var s = JSON.parse(localStorage.getItem('pe-state')); if (s && typeof s.x === 'number') return s; } catch(e){}
    return { x: 0, y: window.innerHeight - 80, lrcVisible: true, lrcX: 100, lrcY: 100 };
  }

  // ==================== Bootstrap ====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 1000); });
  } else { setTimeout(init, 1000); }
  document.addEventListener('pjax:complete', function () { retryCount = 0; initialized = false; setTimeout(init, 1000); });
})();

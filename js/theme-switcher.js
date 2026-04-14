/**
 * Theme Color Switcher v5
 * - Colored gradient base layer
 * - Semi-transparent frosted-glass cards
 * - Footer, nav, TOC highlight, and all accent colors sync with theme
 */
(function () {
  'use strict';

  var SCHEMES = [
    {
      name: '默认紫', main: '#6C63FF', hover: '#FF6584',
      baseBg: 'linear-gradient(135deg, #e8e6ff 0%, #f0e6ff 50%, #e6ecff 100%)',
      baseBgDark: 'linear-gradient(135deg, #1a1830 0%, #1e1a2e 50%, #1a1e30 100%)',
      cardBg: 'rgba(255,255,255,0.42)', cardBgDark: 'rgba(25,25,40,0.45)',
      sidebarBg: 'rgba(240,240,255,0.38)', sidebarBgDark: 'rgba(25,25,40,0.38)',
      playerBg: 'rgba(255,255,255,0.6)', playerBgDark: 'rgba(25,25,40,0.6)',
      footerBg: 'rgba(88,80,220,0.75)', footerBgDark: 'rgba(30,25,60,0.8)',
      navBg: 'rgba(88,80,220,0.65)', navBgDark: 'rgba(20,18,40,0.7)',
    },
    {
      name: '清新绿', main: '#00b894', hover: '#fdcb6e',
      baseBg: 'linear-gradient(135deg, #e6fff5 0%, #e0f8ec 50%, #dffff0 100%)',
      baseBgDark: 'linear-gradient(135deg, #0d2818 0%, #0f2e1c 50%, #0d2818 100%)',
      cardBg: 'rgba(240,255,248,0.42)', cardBgDark: 'rgba(15,35,25,0.45)',
      sidebarBg: 'rgba(235,255,245,0.38)', sidebarBgDark: 'rgba(15,35,25,0.38)',
      playerBg: 'rgba(240,255,248,0.6)', playerBgDark: 'rgba(15,35,25,0.6)',
      footerBg: 'rgba(0,150,120,0.75)', footerBgDark: 'rgba(10,40,28,0.8)',
      navBg: 'rgba(0,150,120,0.65)', navBgDark: 'rgba(10,30,20,0.7)',
    },
    {
      name: '落日橙', main: '#e17055', hover: '#d63031',
      baseBg: 'linear-gradient(135deg, #fff0e6 0%, #ffe8dd 50%, #fff5ee 100%)',
      baseBgDark: 'linear-gradient(135deg, #2e1a0d 0%, #331c0f 50%, #2e1a0d 100%)',
      cardBg: 'rgba(255,245,238,0.42)', cardBgDark: 'rgba(40,25,15,0.45)',
      sidebarBg: 'rgba(255,242,235,0.38)', sidebarBgDark: 'rgba(40,25,15,0.38)',
      playerBg: 'rgba(255,248,240,0.6)', playerBgDark: 'rgba(40,25,15,0.6)',
      footerBg: 'rgba(190,90,65,0.75)', footerBgDark: 'rgba(50,25,15,0.8)',
      navBg: 'rgba(190,90,65,0.65)', navBgDark: 'rgba(40,20,12,0.7)',
    },
    {
      name: '天空蓝', main: '#0984e3', hover: '#6c5ce7',
      baseBg: 'linear-gradient(135deg, #e6f0ff 0%, #dce8ff 50%, #e6f5ff 100%)',
      baseBgDark: 'linear-gradient(135deg, #0d1a2e 0%, #0f1e33 50%, #0d1a2e 100%)',
      cardBg: 'rgba(235,245,255,0.42)', cardBgDark: 'rgba(15,25,40,0.45)',
      sidebarBg: 'rgba(230,242,255,0.38)', sidebarBgDark: 'rgba(15,25,40,0.38)',
      playerBg: 'rgba(240,248,255,0.6)', playerBgDark: 'rgba(15,25,40,0.6)',
      footerBg: 'rgba(8,108,195,0.75)', footerBgDark: 'rgba(10,20,45,0.8)',
      navBg: 'rgba(8,108,195,0.65)', navBgDark: 'rgba(8,18,35,0.7)',
    },
    {
      name: '樱花粉', main: '#e84393', hover: '#fd79a8',
      baseBg: 'linear-gradient(135deg, #ffe6f0 0%, #ffdde8 50%, #ffe6f5 100%)',
      baseBgDark: 'linear-gradient(135deg, #2e0d1a 0%, #330f1e 50%, #2e0d1a 100%)',
      cardBg: 'rgba(255,238,245,0.42)', cardBgDark: 'rgba(40,15,25,0.45)',
      sidebarBg: 'rgba(255,235,242,0.38)', sidebarBgDark: 'rgba(40,15,25,0.38)',
      playerBg: 'rgba(255,240,248,0.6)', playerBgDark: 'rgba(40,15,25,0.6)',
      footerBg: 'rgba(200,50,120,0.75)', footerBgDark: 'rgba(45,12,28,0.8)',
      navBg: 'rgba(200,50,120,0.65)', navBgDark: 'rgba(35,10,22,0.7)',
    },
    {
      name: '薄荷青', main: '#00cec9', hover: '#81ecec',
      baseBg: 'linear-gradient(135deg, #e0fffe 0%, #dffaf8 50%, #e0fffc 100%)',
      baseBgDark: 'linear-gradient(135deg, #0a2524 0%, #0c2a28 50%, #0a2524 100%)',
      cardBg: 'rgba(230,255,252,0.42)', cardBgDark: 'rgba(12,35,33,0.45)',
      sidebarBg: 'rgba(225,255,250,0.38)', sidebarBgDark: 'rgba(12,35,33,0.38)',
      playerBg: 'rgba(235,255,252,0.6)', playerBgDark: 'rgba(12,35,33,0.6)',
      footerBg: 'rgba(0,170,165,0.75)', footerBgDark: 'rgba(8,38,36,0.8)',
      navBg: 'rgba(0,170,165,0.65)', navBgDark: 'rgba(6,30,28,0.7)',
    },
    {
      name: '琥珀金', main: '#e1a145', hover: '#f39c12',
      baseBg: 'linear-gradient(135deg, #fff8e6 0%, #fff3d6 50%, #fffae8 100%)',
      baseBgDark: 'linear-gradient(135deg, #2e250d 0%, #332a0f 50%, #2e250d 100%)',
      cardBg: 'rgba(255,248,230,0.42)', cardBgDark: 'rgba(40,35,15,0.45)',
      sidebarBg: 'rgba(255,245,225,0.38)', sidebarBgDark: 'rgba(40,35,15,0.38)',
      playerBg: 'rgba(255,250,235,0.6)', playerBgDark: 'rgba(40,35,15,0.6)',
      footerBg: 'rgba(190,135,55,0.75)', footerBgDark: 'rgba(50,40,12,0.8)',
      navBg: 'rgba(190,135,55,0.65)', navBgDark: 'rgba(40,32,10,0.7)',
    },
    {
      name: '石墨灰', main: '#636e72', hover: '#b2bec3',
      baseBg: 'linear-gradient(135deg, #eef0f0 0%, #e8ebed 50%, #f0f2f2 100%)',
      baseBgDark: 'linear-gradient(135deg, #1a1c1e 0%, #1e2022 50%, #1a1c1e 100%)',
      cardBg: 'rgba(245,247,248,0.42)', cardBgDark: 'rgba(30,32,35,0.45)',
      sidebarBg: 'rgba(242,245,246,0.38)', sidebarBgDark: 'rgba(30,32,35,0.38)',
      playerBg: 'rgba(248,249,250,0.6)', playerBgDark: 'rgba(30,32,35,0.6)',
      footerBg: 'rgba(80,90,95,0.75)', footerBgDark: 'rgba(25,28,30,0.8)',
      navBg: 'rgba(80,90,95,0.65)', navBgDark: 'rgba(20,22,24,0.7)',
    },
    {
      name: '暗夜红', main: '#c0392b', hover: '#e74c3c',
      baseBg: 'linear-gradient(135deg, #fce8e6 0%, #f8dbd8 50%, #fce8e6 100%)',
      baseBgDark: 'linear-gradient(135deg, #2a0f0c 0%, #30120e 50%, #2a0f0c 100%)',
      cardBg: 'rgba(255,235,232,0.42)', cardBgDark: 'rgba(38,15,12,0.45)',
      sidebarBg: 'rgba(255,230,228,0.38)', sidebarBgDark: 'rgba(38,15,12,0.38)',
      playerBg: 'rgba(255,238,235,0.6)', playerBgDark: 'rgba(38,15,12,0.6)',
      footerBg: 'rgba(160,45,35,0.75)', footerBgDark: 'rgba(42,14,10,0.8)',
      navBg: 'rgba(160,45,35,0.65)', navBgDark: 'rgba(35,12,8,0.7)',
    },
    {
      name: '靛青', main: '#6c5ce7', hover: '#a29bfe',
      baseBg: 'linear-gradient(135deg, #ece8ff 0%, #e6e0ff 50%, #ece8ff 100%)',
      baseBgDark: 'linear-gradient(135deg, #18142e 0%, #1c1833 50%, #18142e 100%)',
      cardBg: 'rgba(238,232,255,0.42)', cardBgDark: 'rgba(25,20,42,0.45)',
      sidebarBg: 'rgba(235,228,255,0.38)', sidebarBgDark: 'rgba(25,20,42,0.38)',
      playerBg: 'rgba(240,235,255,0.6)', playerBgDark: 'rgba(25,20,42,0.6)',
      footerBg: 'rgba(88,75,195,0.75)', footerBgDark: 'rgba(22,18,48,0.8)',
      navBg: 'rgba(88,75,195,0.65)', navBgDark: 'rgba(18,15,40,0.7)',
    },
  ];

  function init() {
    if (document.getElementById('theme-switcher-btn')) return;
    injectCSS();
    ensureBaseLayer();

    var btn = document.createElement('button');
    btn.id = 'theme-switcher-btn';
    btn.type = 'button';
    btn.title = '切换主题色';
    btn.innerHTML = '&#127912;';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var p = document.getElementById('theme-switcher-panel');
      p.style.display = p.style.display === 'none' ? 'grid' : 'none';
    });

    var panel = document.createElement('div');
    panel.id = 'theme-switcher-panel';
    panel.style.display = 'none';

    SCHEMES.forEach(function (scheme, idx) {
      var dot = document.createElement('button');
      dot.className = 'ts-dot';
      dot.title = scheme.name;
      dot.style.background = scheme.main;
      dot.addEventListener('click', function (e) {
        e.stopPropagation();
        applyScheme(idx);
        panel.style.display = 'none';
      });
      panel.appendChild(dot);
    });

    // Mount independently on body, positioned above #rightside via CSS
    var wrap = document.createElement('div');
    wrap.id = 'theme-switcher';
    wrap.appendChild(btn);
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    // Sync visibility with #rightside
    var rightside = document.getElementById('rightside');
    if (rightside) {
      var syncShow = function () {
        wrap.classList.toggle('show', rightside.classList.contains('rightside-show'));
      };
      syncShow();
      new MutationObserver(syncShow).observe(rightside, { attributes: true, attributeFilter: ['class'] });
    }

    document.addEventListener('click', function () { panel.style.display = 'none'; });

    var saved = parseInt(localStorage.getItem('theme-color-idx'));
    if (!isNaN(saved) && saved >= 0 && saved < SCHEMES.length) applyScheme(saved);
  }

  function ensureBaseLayer() {
    if (document.getElementById('pe-base-layer')) return;
    var layer = document.createElement('div');
    layer.id = 'pe-base-layer';
    document.body.insertBefore(layer, document.body.firstChild);
  }

  function applyScheme(idx) {
    var s = SCHEMES[idx];
    var r = document.documentElement;
    var isDark = r.getAttribute('data-theme') === 'dark';

    // Accent colors
    r.style.setProperty('--btn-bg', s.main);
    r.style.setProperty('--btn-hover-bg', s.hover);
    r.style.setProperty('--theme-color', s.main);
    r.style.setProperty('--text-selection', s.main);
    r.style.setProperty('--default-bg-color', s.main);
    r.style.setProperty('--pseudo-hover', s.main);
    r.style.setProperty('--scrollbar-color', s.main);

    // Body transparent -> base layer shows
    r.style.setProperty('--global-bg', 'transparent');

    // Base layer
    var layer = document.getElementById('pe-base-layer');
    if (layer) layer.style.background = isDark ? s.baseBgDark : s.baseBg;
    if (window.__canvasBgUpdate) window.__canvasBgUpdate();

    // Cards semi-transparent
    r.style.setProperty('--card-bg', isDark ? s.cardBgDark : s.cardBg);
    r.style.setProperty('--sidebar-bg', isDark ? s.sidebarBgDark : s.sidebarBg);

    // Footer & nav
    r.style.setProperty('--pe-footer-bg', isDark ? s.footerBgDark : s.footerBg);
    r.style.setProperty('--pe-nav-bg', isDark ? s.navBgDark : s.navBg);

    // Player
    r.style.setProperty('--pe-player-bg', isDark ? s.playerBgDark : s.playerBg);

    // TOC & other accent elements
    r.style.setProperty('--pe-accent', s.main);

    localStorage.setItem('theme-color-idx', idx);
  }

  function injectCSS() {
    if (document.getElementById('ts-css')) return;
    var s = document.createElement('style');
    s.id = 'ts-css';
    s.textContent = [
      // ===== Base layer =====
      '#pe-base-layer {',
      '  position: fixed; top: 0; left: 0; width: 100%; height: 100%;',
      '  z-index: -2; pointer-events: none;',
      '}',

      // ===== Switcher UI =====
      '#theme-switcher {',
      '  position: fixed; bottom: 280px; right: 55px; z-index: 100;',
      '  opacity: 0; transition: all .5s; pointer-events: none;',
      '}',
      '#theme-switcher.show {',
      '  opacity: .8; pointer-events: auto;',
      '}',
      '#theme-switcher-btn {',
      '  display: block; width: 35px; height: 35px; border: none;',
      '  border-radius: 5px; background: var(--btn-bg, #6C63FF);',
      '  color: var(--btn-color, #fff); font-size: 16px; cursor: pointer;',
      '  text-align: center; line-height: 35px;',
      '}',
      '#theme-switcher-btn:hover { background: var(--btn-hover-color); }',
      '#theme-switcher-btn i { vertical-align: baseline; }',
      '#theme-switcher-panel {',
      '  position: absolute; bottom: 0; right: 42px;',
      '  display: grid; grid-template-columns: repeat(2, 1fr);',
      '  gap: 6px; padding: 10px;',
      '  background: rgba(255,255,255,0.8); border-radius: 12px;',
      '  box-shadow: 0 8px 32px rgba(0,0,0,0.15);',
      '  backdrop-filter: blur(12px);',
      '}',
      '[data-theme="dark"] #theme-switcher-panel { background: rgba(30,30,30,0.85); }',
      '@media screen and (max-width: 768px) {',
      '  #theme-switcher { display: none !important; }',
      '}',
      '.ts-dot {',
      '  width: 28px; height: 28px; border-radius: 50%; border: 3px solid transparent;',
      '  cursor: pointer; transition: transform .2s, border-color .2s;',
      '}',
      '.ts-dot:hover {',
      '  transform: scale(1.2); border-color: #fff;',
      '  box-shadow: 0 0 8px rgba(0,0,0,0.3);',
      '}',

      // ===== Frosted glass on cards =====
      '#recent-posts > .recent-post-item,',
      '.layout > div:first-child:not(.nc),',
      '#aside-content .card-widget,',
      '#post, #page, #archive {',
      '  backdrop-filter: blur(14px) saturate(180%) !important;',
      '  -webkit-backdrop-filter: blur(14px) saturate(180%) !important;',
      '}',

      // ===== Footer backdrop =====
      '#footer {',
      '  backdrop-filter: blur(14px) saturate(180%);',
      '  -webkit-backdrop-filter: blur(14px) saturate(180%);',
      '}',

      // ===== Nav bar backdrop =====
      '#nav {',
      '  backdrop-filter: blur(14px) saturate(180%) !important;',
      '  -webkit-backdrop-filter: blur(14px) saturate(180%) !important;',
      '}',
      '#nav a, #nav .site-name { color: #fff !important; }',

      // ===== Player =====
      '.aplayer.aplayer-fixed .aplayer-body {',
      '  background: var(--pe-player-bg, rgba(255,255,255,0.6)) !important;',
      '  backdrop-filter: blur(14px);',
      '}',
      '.aplayer.aplayer-fixed .aplayer-list {',
      '  background: var(--pe-player-bg, rgba(255,255,255,0.6)) !important;',
      '  backdrop-filter: blur(14px);',
      '}',

      // ===== Top img site info =====
      '#page-header.full_page #site-info {',
      '  text-shadow: 0 2px 12px rgba(0,0,0,0.5);',
      '}',
    ].join('\n');
    document.head.appendChild(s);
  }

  // Re-apply on dark/light toggle
  var observer = new MutationObserver(function () {
    var saved = parseInt(localStorage.getItem('theme-color-idx'));
    if (!isNaN(saved) && saved >= 0 && saved < SCHEMES.length) applyScheme(saved);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 500); });
  } else { setTimeout(init, 500); }
  document.addEventListener('pjax:complete', function () { setTimeout(init, 500); });
})();

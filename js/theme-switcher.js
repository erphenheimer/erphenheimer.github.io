/**
 * Three-mode theme switcher.
 * Default mode is lightweight. UBW video and Saber avatar are loaded only when
 * the user explicitly picks the easter egg theme.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'pe-blog-theme';
  var DEFAULT_MODE = 'read';

  var MODES = [
    {
      id: 'read',
      name: '清爽阅读',
      shortName: '阅读',
      accent: '#4f7d66',
      hover: '#2f5645',
      bg: '#f4f7f5',
      card: 'rgba(255, 255, 255, .88)',
      sidebar: 'rgba(250, 252, 250, .9)',
      nav: 'rgba(250, 252, 250, .78)',
      navText: '#24342d',
      footer: 'rgba(236, 242, 238, .92)',
      player: 'rgba(255, 255, 255, .88)',
    },
    {
      id: 'magazine',
      name: '内容杂志',
      shortName: '杂志',
      accent: '#202628',
      hover: '#846143',
      bg: '#f1eadf',
      card: 'rgba(255, 252, 246, .92)',
      sidebar: 'rgba(246, 238, 226, .92)',
      nav: 'rgba(32, 38, 40, .92)',
      navText: '#fff8ed',
      footer: 'rgba(32, 38, 40, .94)',
      player: 'rgba(255, 252, 246, .9)',
    },
    {
      id: 'ubw',
      name: 'Unlimited Blade Works',
      shortName: 'UBW',
      accent: '#d9571c',
      hover: '#ffbf73',
      bg: '#17110e',
      card: 'rgba(37, 25, 20, .86)',
      sidebar: 'rgba(42, 26, 20, .86)',
      nav: 'rgba(56, 20, 14, .88)',
      navText: '#fff4e6',
      footer: 'rgba(35, 18, 12, .94)',
      player: 'rgba(42, 26, 20, .88)',
    },
  ];

  function getMode(id) {
    return MODES.find(function (mode) { return mode.id === id; }) || MODES[0];
  }

  function init() {
    injectCSS();
    mountSwitcher();
    applyMode(readStoredMode());
  }

  function mountSwitcher() {
    if (document.getElementById('theme-switcher')) return;

    var wrap = document.createElement('div');
    wrap.id = 'theme-switcher';

    var btn = document.createElement('button');
    btn.id = 'theme-switcher-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', '切换博客主题');
    btn.setAttribute('title', 'Theme');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<i class="fas fa-palette"></i><span>主题</span>';

    var panel = document.createElement('div');
    panel.id = 'theme-switcher-panel';
    panel.setAttribute('aria-label', '主题选项');

    MODES.forEach(function (mode) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'theme-mode-option';
      item.dataset.mode = mode.id;
      item.innerHTML = '<span class="theme-mode-dot"></span><span>' + mode.name + '</span>';
      item.addEventListener('click', function (event) {
        event.stopPropagation();
        applyMode(mode.id);
        closePanel();
      });
      panel.appendChild(item);
    });

    btn.addEventListener('click', function (event) {
      event.stopPropagation();
      var opened = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });

    document.addEventListener('click', closePanel);
    wrap.appendChild(btn);
    wrap.appendChild(panel);
    document.body.appendChild(wrap);
  }

  function closePanel() {
    var wrap = document.getElementById('theme-switcher');
    var btn = document.getElementById('theme-switcher-btn');
    if (!wrap) return;
    wrap.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function applyMode(id) {
    var mode = getMode(id);
    var root = document.documentElement;

    root.setAttribute('data-blog-theme', mode.id);
    root.style.setProperty('--btn-bg', mode.accent);
    root.style.setProperty('--btn-hover-bg', mode.hover);
    root.style.setProperty('--btn-hover-color', mode.hover);
    root.style.setProperty('--theme-color', mode.accent);
    root.style.setProperty('--text-selection', mode.accent);
    root.style.setProperty('--default-bg-color', mode.accent);
    root.style.setProperty('--pseudo-hover', mode.hover);
    root.style.setProperty('--scrollbar-color', mode.accent);
    root.style.setProperty('--global-bg', mode.bg);
    root.style.setProperty('--card-bg', mode.card);
    root.style.setProperty('--sidebar-bg', mode.sidebar);
    root.style.setProperty('--pe-nav-bg', mode.nav);
    root.style.setProperty('--pe-nav-text', mode.navText);
    root.style.setProperty('--pe-footer-bg', mode.footer);
    root.style.setProperty('--pe-player-bg', mode.player);
    root.style.setProperty('--pe-accent', mode.accent);

    updateSwitcherState(mode.id);
    syncAvatar(mode.id);
    syncHomeVideo(mode.id);
    persistMode(mode.id);
  }

  function readStoredMode() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_MODE;
    } catch (error) {
      return DEFAULT_MODE;
    }
  }

  function persistMode(id) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (error) {
      // Ignore storage failures in private or restricted browsing contexts.
    }
  }

  function updateSwitcherState(id) {
    document.querySelectorAll('.theme-mode-option').forEach(function (option) {
      option.classList.toggle('active', option.dataset.mode === id);
    });
  }

  function syncAvatar(id) {
    var header = document.getElementById('page-header');
    var defaultAvatar = header && header.dataset.defaultAvatar;
    var eggAvatar = header && header.dataset.eggAvatar;
    if (!defaultAvatar || !eggAvatar) return;

    document.querySelectorAll('.avatar-img img').forEach(function (img) {
      img.src = id === 'ubw' ? eggAvatar : defaultAvatar;
    });
  }

  function syncHomeVideo(id) {
    var header = document.getElementById('page-header');
    if (!header || !header.classList.contains('pe-home-hero')) return;

    var existing = header.querySelector('#header-video');
    if (id !== 'ubw') {
      if (existing) existing.remove();
      header.classList.remove('pe-egg-video-ready');
      return;
    }

    if (existing || !header.dataset.eggVideo) return;

    var video = document.createElement('video');
    video.id = 'header-video';
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';

    var source = document.createElement('source');
    source.src = header.dataset.eggVideo;
    source.type = 'video/mp4';
    video.appendChild(source);
    header.insertBefore(video, header.firstChild);
    header.classList.add('pe-egg-video-ready');
  }

  function injectCSS() {
    if (document.getElementById('pe-theme-switcher-css')) return;

    var style = document.createElement('style');
    style.id = 'pe-theme-switcher-css';
    style.textContent = [
      '#theme-switcher { position: fixed; right: var(--pe-control-right, 10px); bottom: calc(var(--pe-theme-bottom, 148px) + env(safe-area-inset-bottom)); z-index: var(--pe-theme-layer, 126); }',
      '#theme-switcher-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; width: 42px; min-width: 42px; height: 38px; padding: 0; border-radius: 8px; background: var(--btn-bg); color: #fff; box-shadow: 0 10px 28px rgba(31, 42, 38, .18); transition: transform .26s cubic-bezier(.16,1,.3,1), background .26s; }',
      '#theme-switcher-btn:hover { transform: translateY(-2px); background: var(--btn-hover-bg); }',
      '#theme-switcher-btn span { display: none; font-size: 13px; line-height: 1; }',
      '#theme-switcher-panel { position: absolute; right: 0; bottom: calc(100% + 10px); width: min(210px, calc(100vw - 28px)); padding: 8px; border: 1px solid rgba(119, 137, 127, .2); border-radius: 10px; background: rgba(255, 255, 255, .92); box-shadow: 0 22px 56px rgba(31, 42, 38, .16); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); opacity: 0; transform: translateY(8px); pointer-events: none; transition: opacity .24s cubic-bezier(.16,1,.3,1), transform .24s cubic-bezier(.16,1,.3,1); }',
      '#theme-switcher.open #theme-switcher-panel { opacity: 1; transform: translateY(0); pointer-events: auto; }',
      '.theme-mode-option { width: 100%; display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 8px; color: #26352e; text-align: left; transition: background .22s, color .22s; }',
      '.theme-mode-option:hover, .theme-mode-option.active { background: rgba(79, 125, 102, .12); color: var(--btn-bg); }',
      '.theme-mode-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--btn-bg); box-shadow: 0 0 0 3px rgba(79, 125, 102, .12); }',
      '[data-blog-theme=\"magazine\"] .theme-mode-option:hover, [data-blog-theme=\"magazine\"] .theme-mode-option.active { background: rgba(32, 38, 40, .1); }',
      '[data-blog-theme=\"ubw\"] #theme-switcher-panel { background: rgba(31, 19, 14, .92); border-color: rgba(255, 190, 119, .22); }',
      '[data-blog-theme=\"ubw\"] .theme-mode-option { color: #ffe8c8; }',
      '[data-blog-theme=\"ubw\"] .theme-mode-option:hover, [data-blog-theme=\"ubw\"] .theme-mode-option.active { background: rgba(217, 87, 28, .22); color: #fff3df; }',
      'body:has(#rightside-config-hide.show) #theme-switcher, body:has(#card-toc.open) #theme-switcher { bottom: calc(var(--pe-theme-bottom-expanded, 252px) + env(safe-area-inset-bottom)); }',
      '@media screen and (max-width: 900px) { #theme-switcher { right: var(--pe-control-right, 10px); bottom: calc(var(--pe-theme-bottom-mobile, 176px) + env(safe-area-inset-bottom)); } body:has(#rightside-config-hide.show) #theme-switcher, body:has(#card-toc.open) #theme-switcher { bottom: calc(var(--pe-theme-bottom-mobile-expanded, 256px) + env(safe-area-inset-bottom)); } #theme-switcher-panel { width: min(196px, calc(100vw - 28px)); } }',
    ].join('\n');
    document.head.appendChild(style);
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }

  document.addEventListener('pjax:complete', function () {
    if (!document.getElementById('theme-switcher')) mountSwitcher();
    applyMode(readStoredMode());
  });

  var observer = new MutationObserver(function () {
    applyMode(readStoredMode());
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();

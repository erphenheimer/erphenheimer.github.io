/**
 * Archive page - Sort & Tag filter
 * v1.3：列表改为卡片后，筛选逻辑改为对现有卡片 DOM 重排/显隐，
 * 不再重建标记（卡片结构由 post-card.pug 模板负责）。
 */
(function () {
  'use strict';

  function init() {
    var toolbar = document.getElementById('archive-toolbar');
    var tagFilter = document.getElementById('archive-tag-filter');
    var posts = window.__archivePosts;
    if (!toolbar || !tagFilter || !posts) return;

    var container = document.querySelector('#archive .pe-post-cards');
    if (!container) return;

    // Collect all tags
    var tagSet = {};
    posts.forEach(function (p) {
      (p.tags || []).forEach(function (t) { tagSet[t] = (tagSet[t] || 0) + 1; });
    });

    // Populate tag dropdown
    var sortedTags = Object.keys(tagSet).sort(function (a, b) { return tagSet[b] - tagSet[a]; });
    sortedTags.forEach(function (tag) {
      var opt = document.createElement('option');
      opt.value = tag;
      opt.textContent = tag + ' (' + tagSet[tag] + ')';
      tagFilter.appendChild(opt);
    });

    var currentSort = 'time-desc';
    var currentTag = 'all';

    // Sort button click
    toolbar.addEventListener('click', function (e) {
      var btn = e.target.closest('.archive-sort-btn');
      if (!btn) return;
      toolbar.querySelectorAll('.archive-sort-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      render();
    });

    // Tag filter change
    tagFilter.addEventListener('change', function () {
      currentTag = tagFilter.value;
      render();
    });

    function render() {
      var cards = Array.prototype.slice.call(container.querySelectorAll('.pe-post-card'));
      if (!cards.length) return;

      var visible = 0;

      // Sort: reorder DOM nodes by card date
      cards.sort(function (a, b) {
        return currentSort === 'time-asc'
          ? a.dataset.date - b.dataset.date
          : b.dataset.date - a.dataset.date;
      });
      cards.forEach(function (card) { container.appendChild(card); });

      // Filter: hide cards without the selected tag
      cards.forEach(function (card) {
        var tags = (card.dataset.tags || '').split('|');
        var show = currentTag === 'all' || tags.indexOf(currentTag) !== -1;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      // Update count
      var titleEl = document.querySelector('#archive .pe-list-heading');
      if (titleEl) {
        titleEl.textContent = '文章 - ' + visible;
      }
    }
  }

  // Run after page load / pjax
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Support PJAX reload
  document.addEventListener('pjax:complete', init);
})();

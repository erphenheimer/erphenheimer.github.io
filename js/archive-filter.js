/**
 * Archive page - Sort & Tag filter
 */
(function () {
  'use strict';

  function init() {
    var toolbar = document.getElementById('archive-toolbar');
    var tagFilter = document.getElementById('archive-tag-filter');
    var posts = window.__archivePosts;
    if (!toolbar || !tagFilter || !posts) return;

    var container = document.querySelector('#archive .article-sort');
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
      var filtered = posts.slice();

      // Filter by tag
      if (currentTag !== 'all') {
        filtered = filtered.filter(function (p) {
          return p.tags && p.tags.indexOf(currentTag) !== -1;
        });
      }

      // Sort
      if (currentSort === 'time-desc') {
        filtered.sort(function (a, b) { return b.date - a.date; });
      } else if (currentSort === 'time-asc') {
        filtered.sort(function (a, b) { return a.date - b.date; });
      }

      // Rebuild DOM
      container.innerHTML = '';
      var year = null;
      var coverEnabled = true; // assume covers enabled

      filtered.forEach(function (article) {
        var d = new Date(article.date);
        var tempYear = d.getFullYear().toString();

        if (tempYear !== year) {
          year = tempYear;
          var yearEl = document.createElement('div');
          yearEl.className = 'article-sort-item year';
          yearEl.textContent = year;
          container.appendChild(yearEl);
        }

        var item = document.createElement('div');
        var noCover = !article.cover ? 'no-article-cover' : '';
        item.className = 'article-sort-item ' + noCover;

        var html = '';
        if (article.cover && coverEnabled) {
          if (article.cover_type === 'img') {
            html += '<a class="article-sort-item-img" href="/' + article.path + '" title="' + esc(article.title) + '">' +
              '<img src="' + article.cover + '" alt="' + esc(article.title) + '"></a>';
          } else if (article.cover) {
            html += '<a class="article-sort-item-img" href="/' + article.path + '" title="' + esc(article.title) + '">' +
              '<div style="background:' + article.cover + '"></div></a>';
          }
        }

        var dateStr = formatDate(d);
        html += '<div class="article-sort-item-info">' +
          '<div class="article-sort-item-time"><i class="far fa-calendar-alt"></i> ' +
          '<time>' + dateStr + '</time></div>' +
          '<a class="article-sort-item-title" href="/' + article.path + '" title="' + esc(article.title) + '">' + esc(article.title) + '</a>';

        // Show tags
        if (article.tags && article.tags.length) {
          html += '<div class="article-sort-item-tags" style="margin-top:4px;display:flex;flex-wrap:wrap;gap:4px;">';
          article.tags.forEach(function (t) {
            html += '<span style="font-size:11px;padding:1px 6px;border-radius:4px;background:var(--btn-bg,#6C63FF);color:#fff;opacity:0.8;">' + esc(t) + '</span>';
          });
          html += '</div>';
        }

        html += '</div>';
        item.innerHTML = html;
        container.appendChild(item);
      });

      // Update count
      var titleEl = document.querySelector('#archive .article-sort-title');
      if (titleEl) {
        titleEl.textContent = '文章 - ' + filtered.length;
      }
    }

    function formatDate(d) {
      var y = d.getFullYear();
      var m = ('0' + (d.getMonth() + 1)).slice(-2);
      var day = ('0' + d.getDate()).slice(-2);
      return y + '-' + m + '-' + day;
    }

    function esc(s) {
      var el = document.createElement('span');
      el.textContent = s;
      return el.innerHTML;
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

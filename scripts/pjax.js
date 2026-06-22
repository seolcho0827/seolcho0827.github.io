/**
 * PJAX navigation module
 * Handles smooth page transitions with History API
 */
(function(){
  var contentArea = document.querySelector('.skeleton-content');

  function updateNavActive(url) {
    document.querySelectorAll('.skeleton-nav-item').forEach(function(n) {
      var h = n.getAttribute('href');
      // Normalize: strip trailing slash for comparison
      var normalizedUrl = url.replace(/\/+$/, '');
      var normalizedHref = h ? h.replace(/\/+$/, '') : '';
      n.classList.toggle('active', normalizedHref && (normalizedHref === normalizedUrl || (normalizedHref !== '/' && normalizedUrl.indexOf(normalizedHref) === 0)));
    });
  }

  function showError(msg) {
    var existing = contentArea.querySelector('.content-inner');
    if (existing) {
      existing.innerHTML = '<div class="error-page"><div class="error-code">404</div><p class="error-message">' + msg + '</p><a href="/" class="error-link">回到首页</a></div>';
    }
  }

  function executeScripts(container) {
    // Find and execute <script> tags in newly loaded content
    var scripts = container.querySelectorAll('script');
    scripts.forEach(function(oldScript) {
      var newScript = document.createElement('script');
      if (oldScript.src) {
        // External script: copy src and async attributes
        newScript.src = oldScript.src;
        newScript.async = oldScript.async || false;
      } else {
        // Inline script: copy text content
        newScript.textContent = oldScript.textContent;
      }
      // Replace old script with new one to force execution
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }

  function loadPage(url, push) {
    if (!url || url === location.pathname + location.search || url === location.href) return;
    if (push !== false) history.pushState(null, '', url);
    updateNavActive(url);
    contentArea.style.opacity = '0.4';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function() {
      contentArea.style.opacity = '1';
      if (xhr.status < 200 || xhr.status >= 400) {
        showError('这个页面已经走丢了……');
        // Fix: better title handling
        var parts = document.title.split('|');
        document.title = '404 | ' + (parts.length > 1 ? parts[parts.length - 1].trim() : document.title);
        return;
      }
      var tmp = document.createElement('div');
      tmp.innerHTML = xhr.responseText;
      var newContent = tmp.querySelector('.content-inner');
      var newTitle = tmp.querySelector('title');
      var existing = contentArea.querySelector('.content-inner');
      if (existing && newContent) {
        existing.innerHTML = newContent.innerHTML;
        // Execute any <script> tags in the loaded content
        executeScripts(existing);
      } else if (existing) {
        showError('这个页面暂时没有内容');
      }
      if (newTitle) document.title = newTitle.textContent;
    };
    xhr.onerror = function() {
      contentArea.style.opacity = '1';
      showError('加载失败，请检查网络连接');
    };
    xhr.send();
  }

  function pjaxFetch(url) { loadPage(url, false); }

  function init() {
    if (!contentArea) return;
    updateNavActive(location.pathname);

    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
      if (href.startsWith('http') || href.startsWith('//')) {
        try {
          var url = new URL(href);
          if (url.hostname !== location.hostname) return;
          href = url.pathname + url.search;
        } catch(e) { return; }
      }
      if (link.closest('.bg-widget, .welcome-btn, #welcome-btn, .pagination-link')) return;
      e.preventDefault();
      loadPage(href);
    });

    window.addEventListener('popstate', function() {
      updateNavActive(location.pathname);
      pjaxFetch(location.href);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

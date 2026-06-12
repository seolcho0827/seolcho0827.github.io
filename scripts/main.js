/**
 * VFD Terminal Theme - Main JavaScript
 * Gridea Pro Theme: VFD Terminal v1.0.0
 */
(function () {
  'use strict';

  // ── Apply theme_config CSS variables ──
  function applyThemeConfig() {
    const root = document.documentElement;
    // Read from data attributes set by Jinja2 template
    const primaryColor = root.dataset.primaryColor || '#00ffcc';
    const bgColor = root.dataset.bgColor || '#0a0a0a';
    const cardBg = root.dataset.cardBg || '#111111';
    const borderColor = root.dataset.borderColor || '#1a3a3a';
    const glowIntensity = root.dataset.glowIntensity || '8';
    const scanlineOpacity = root.dataset.scanlineOpacity || '3';
    const sidebarWidth = root.dataset.sidebarWidth || '280';
    const contentWidth = root.dataset.contentWidth || '780';

    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--bg-color', bgColor);
    root.style.setProperty('--card-bg', cardBg);
    root.style.setProperty('--border-color', borderColor);
    root.style.setProperty('--glow-intensity', glowIntensity + 'px');
    root.style.setProperty('--scanline-opacity', (parseInt(scanlineOpacity) / 100).toFixed(2));
    root.style.setProperty('--sidebar-width', sidebarWidth + 'px');
    root.style.setProperty('--content-width', contentWidth + 'px');
  }

  // ── Mobile menu toggle ──
  function initMobileMenu() {
    const btn = document.querySelector('.mobile-menu-btn');
    const menu = document.querySelector('.mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      btn.classList.toggle('is-active');
      // Toggle aria
      const isOpen = menu.classList.contains('is-open');
      btn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu on link click
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        btn.classList.remove('is-active');
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        menu.classList.remove('is-open');
        btn.classList.remove('is-active');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Scanline overlay ──
  function initScanlines() {
    const scanlineOpacity = getComputedStyle(document.documentElement).getPropertyValue('--scanline-opacity').trim();
    if (parseFloat(scanlineOpacity) <= 0) return;

    const overlay = document.createElement('div');
    overlay.className = 'scanlines';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  // ── VFD flicker effect on page load ──
  function initVFDFlicker() {
    document.body.classList.add('vfd-boot');
    setTimeout(function () {
      document.body.classList.remove('vfd-boot');
      document.body.classList.add('vfd-ready');
    }, 300);
  }

  // ── Smooth scroll for anchor links ──
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ── External link handling ──
  function initExternalLinks() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      const href = link.getAttribute('href');
      if (href && href.startsWith('http') && !href.includes(location.hostname)) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }

  // ── Reading progress bar (for post pages) ──
  function initReadingProgress() {
    const article = document.querySelector('.article-content');
    if (!article) return;

    const bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    window.addEventListener('scroll', function () {
      const rect = article.getBoundingClientRect();
      const total = article.scrollHeight;
      const visible = window.innerHeight;
      const scrolled = -rect.top;
      const progress = Math.min(Math.max(scrolled / (total - visible), 0), 1);
      bar.style.width = (progress * 100) + '%';
    }, { passive: true });
  }

  // ── Code block copy button ──
  function initCodeCopy() {
    document.querySelectorAll('pre').forEach(function (pre) {
      const btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = 'COPY';
      btn.setAttribute('aria-label', '复制代码');
      pre.style.position = 'relative';
      pre.appendChild(btn);

      btn.addEventListener('click', function () {
        const code = pre.querySelector('code');
        if (!code) return;
        navigator.clipboard.writeText(code.textContent).then(function () {
          btn.textContent = 'OK!';
          btn.classList.add('is-copied');
          setTimeout(function () {
            btn.textContent = 'COPY';
            btn.classList.remove('is-copied');
          }, 2000);
        });
      });
    });
  }

  // ── Image lazy loading with fade-in ──
  function initLazyImages() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            img.classList.add('is-loaded');
            observer.unobserve(img);
          }
        });
      }, { rootMargin: '50px' });

      document.querySelectorAll('img[data-src]').forEach(function (img) {
        observer.observe(img);
      });
    }
  }

  // ── Back to top button ──
  function initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '&#9650;';
    btn.setAttribute('aria-label', '返回顶部');
    btn.title = '返回顶部';
    document.body.appendChild(btn);

    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Initialize all ──
  function init() {
    applyThemeConfig();
    initMobileMenu();
    initScanlines();
    initVFDFlicker();
    initSmoothScroll();
    initExternalLinks();
    initReadingProgress();
    initCodeCopy();
    initLazyImages();
    initBackToTop();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

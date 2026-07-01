// Apply saved theme immediately to avoid flash of wrong theme
(function () {
  if (localStorage.getItem('theme') === 'light') document.body.classList.add('light-mode');
}());

document.addEventListener('DOMContentLoaded', function () {
  // ── Hamburger menu ──────────────────────────────────
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.toggle('open');
      nav.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when a link is clicked
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on click outside
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !nav.contains(e.target)) {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      }
    });
  }

  // ── Reading mode ────────────────────────────────────
  const readingBtn = document.getElementById('reading-mode-btn');
  if (readingBtn) {
    readingBtn.addEventListener('click', function () {
      const active = document.body.classList.toggle('reading-mode');
      readingBtn.classList.toggle('active', active);
      readingBtn.textContent = active ? '✕ Modo lectura' : '☰ Modo lectura';
    });
  }

  // ── Scroll to top ───────────────────────────────────
  const scrollBtn = document.getElementById('scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', function () {
      scrollBtn.classList.toggle('visible', window.scrollY > 400);
    });
    scrollBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Compartir ────────────────────────────────────────
  document.querySelectorAll('.share-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const action = btn.dataset.action;
      const url    = encodeURIComponent(window.location.href);
      const title  = encodeURIComponent(document.title);

      if (action === 'whatsapp') {
        window.open('https://wa.me/?text=' + title + '%20' + url, '_blank');
      } else if (action === 'twitter') {
        window.open('https://twitter.com/intent/tweet?text=' + title + '&url=' + url, '_blank');
      } else if (action === 'copy') {
        navigator.clipboard.writeText(window.location.href).then(function () {
          btn.textContent = '✓ Copiado';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copiar link';
            btn.classList.remove('copied');
          }, 2000);
        });
      }
    });
  });

  // ── Active nav link ─────────────────────────────────
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('nav a').forEach(function (link) {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkFile = href.split('/').pop();

    if (linkFile === currentFile) {
      link.classList.add('active');
    }
    // Home
    if ((currentFile === '' || currentFile === 'index.html') && linkFile === 'index.html') {
      link.classList.add('active');
    }
  });

  // ── 3D Card Tilt ────────────────────────────────────
  initCardTilt();

  // ── Scroll Fade-in ──────────────────────────────────
  initScrollFadeIn();

  // ── Theme Toggle ─────────────────────────────────────
  initThemeToggle();

  // ── Reading Progress Bar (artículos only) ────────────
  if (document.querySelector('.post-article')) initReadingProgress();
});

// ── 3D tilt on post cards (desktop only) ─────────────
function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  var activeCard = null;

  document.addEventListener('mousemove', function (e) {
    var card = e.target.closest('.post-card');

    if (activeCard && activeCard !== card) {
      activeCard.classList.remove('tilting');
      activeCard.style.transform = '';
      activeCard = null;
    }

    if (!card) return;

    if (!activeCard) {
      card.classList.add('tilting');
    }

    activeCard = card;
    var rect = card.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform =
      'perspective(700px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 8) + 'deg) translateY(-4px)';
  });

  document.addEventListener('mouseleave', function () {
    if (activeCard) {
      activeCard.classList.remove('tilting');
      activeCard.style.transform = '';
      activeCard = null;
    }
  });
}

// ── Theme toggle ─────────────────────────────────────
function initThemeToggle() {
  var SVG_SUN = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var SVG_MOON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  var btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.setAttribute('aria-label', 'Cambiar tema');
  btn.innerHTML = document.body.classList.contains('light-mode') ? SVG_MOON : SVG_SUN;

  var headerInner = document.querySelector('.header-inner');
  if (headerInner) headerInner.appendChild(btn);

  btn.addEventListener('click', function () {
    var isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    btn.innerHTML = isLight ? SVG_MOON : SVG_SUN;
  });
}

// ── Reading progress bar (article pages only) ────────
function initReadingProgress() {
  var bar = document.createElement('div');
  bar.className = 'reading-progress';
  document.body.prepend(bar);

  window.addEventListener('scroll', function () {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    bar.style.width = Math.min(100, (window.scrollY / docHeight) * 100) + '%';
  }, { passive: true });
}

// ── Fade-in on scroll (Intersection Observer) ─────────
function initScrollFadeIn() {
  if (!window.IntersectionObserver) return;

  document.body.classList.add('js-animate');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  function observeCards() {
    document.querySelectorAll('.post-card:not(.visible)').forEach(function (card) {
      observer.observe(card);
    });
  }

  observeCards();

  // Watch for dynamically rendered cards
  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.addedNodes.length) observeCards();
    });
  }).observe(document.body, { childList: true, subtree: true });
}

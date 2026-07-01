// Path prefix: '' for root pages, '../' for flat posts, '../../' for posts/YYYY-MM-DD/ subdirectories
const _path = window.location.pathname;
const PATH_PREFIX = !_path.includes('/posts/') ? ''
  : (_path.match(/\/posts\/[^/]+\/[^/]+\.html/) ? '../../' : '../');

// ── Estado de filtros ─────────────────────────────────────────────────────────
let _categorias   = [];
let _searchQuery  = '';
let _gameFilter   = '';
let _tagFilter    = '';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCategoryLabel(cat) {
  return { tecnologia: 'Tecnología', gaming: 'Gaming', 'patch-notes': 'Patch Notes', comunidad: 'Comunidad' }[cat] || cat;
}

function getBadgeClass(cat) {
  return { tecnologia: 'badge-tech', gaming: 'badge-gaming', 'patch-notes': 'badge-patch-notes', comunidad: 'badge-comunidad' }[cat] || 'badge-gaming';
}

function getCoverGradientClass(cat) {
  return { tecnologia: 'cat-tecnologia', gaming: 'cat-gaming', 'patch-notes': 'cat-patch-notes', comunidad: 'cat-comunidad' }[cat] || 'cat-gaming';
}

function getCoverIcon(cat) {
  var icons = {
    gaming:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>" +
      "<path d='M8 28 Q8 20 16 20 L48 20 Q56 20 56 28 L54 42 Q53 47 49 47 Q45 47 43 42 L40 36 L24 36 L21 42 Q19 47 15 47 Q11 47 10 42 Z'/>" +
      "<line x1='20' y1='28' x2='20' y2='34'/><line x1='17' y1='31' x2='23' y2='31'/>" +
      "<circle cx='42' cy='28' r='2.5' fill='currentColor' stroke='none'/>" +
      "<circle cx='46' cy='33' r='2.5' fill='currentColor' stroke='none'/>" +
      "<circle cx='38' cy='33' r='2.5' fill='currentColor' stroke='none'/>" +
      "<circle cx='42' cy='37' r='2.5' fill='currentColor' stroke='none'/>" +
      "</svg>",
    'patch-notes':
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>" +
      "<rect x='12' y='8' width='30' height='40' rx='4'/>" +
      "<line x1='20' y1='20' x2='34' y2='20'/><line x1='20' y1='28' x2='34' y2='28'/><line x1='20' y1='36' x2='28' y2='36'/>" +
      "<path d='M36 42 L48 30 L54 36 L42 48 L36 50 Z'/>" +
      "</svg>",
    tecnologia:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none' stroke='currentColor' stroke-linecap='round'>" +
      "<rect x='18' y='18' width='28' height='28' rx='4' stroke-width='2.5'/>" +
      "<rect x='24' y='24' width='16' height='16' rx='2' stroke-width='1.5'/>" +
      "<line x1='26' y1='18' x2='26' y2='11' stroke-width='2'/><line x1='32' y1='18' x2='32' y2='11' stroke-width='2'/><line x1='38' y1='18' x2='38' y2='11' stroke-width='2'/>" +
      "<line x1='26' y1='46' x2='26' y2='53' stroke-width='2'/><line x1='32' y1='46' x2='32' y2='53' stroke-width='2'/><line x1='38' y1='46' x2='38' y2='53' stroke-width='2'/>" +
      "<line x1='18' y1='26' x2='11' y2='26' stroke-width='2'/><line x1='18' y1='32' x2='11' y2='32' stroke-width='2'/><line x1='18' y1='38' x2='11' y2='38' stroke-width='2'/>" +
      "<line x1='46' y1='26' x2='53' y2='26' stroke-width='2'/><line x1='46' y1='32' x2='53' y2='32' stroke-width='2'/><line x1='46' y1='38' x2='53' y2='38' stroke-width='2'/>" +
      "</svg>",
    comunidad:
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'>" +
      "<path d='M6 10 Q6 6 10 6 L38 6 Q42 6 42 10 L42 28 Q42 32 38 32 L24 32 L16 40 L16 32 L10 32 Q6 32 6 28 Z'/>" +
      "<path d='M42 18 L52 18 Q56 18 56 22 L56 34 Q56 38 52 38 L50 38 L50 44 L44 38 L34 38'/>" +
      "</svg>"
  };
  return icons[cat] || icons['gaming'];
}

// ── Render cover (imagen o gradiente) ────────────────────────────────────────

function renderCardCover(post) {
  if (post.imagen) {
    var src = /^https?:\/\//.test(post.imagen) ? post.imagen : PATH_PREFIX + post.imagen;
    var isLogo = /\.png$/i.test(post.imagen) || post.logo;
    return '<div class="card-cover' + (isLogo ? ' cover-logo' : '') + '"><img src="' + src + '" alt="' + post.titulo + '" loading="lazy"></div>';
  }
  var label = post.juegoDisplay || getCategoryLabel(post.categoria);
  return '<div class="card-cover">' +
    '<div class="card-cover-gradient ' + getCoverGradientClass(post.categoria) + '">' +
      '<span class="cover-icon">' + getCoverIcon(post.categoria) + '</span>' +
      '<span class="cover-label">' + label + '</span>' +
    '</div>' +
  '</div>';
}

// ── Render single card HTML ───────────────────────────────────────────────────

function renderPostCard(post) {
  const link       = PATH_PREFIX + post.archivo;
  const badgeClass = getBadgeClass(post.categoria);
  const catLabel   = getCategoryLabel(post.categoria);
  const juegoTag   = post.juegoDisplay
    ? '<span class="badge badge-game">' + post.juegoDisplay + '</span>'
    : '';
  
  const affiliateTag = post.afiliado 
    ? '<span class="badge badge-affiliate" title="' + post.afiliado.txt + '">🛒 Oferta</span>'
    : '';

  return '<a href="' + link + '" class="post-card" data-cat="' + post.categoria + '">' +
    renderCardCover(post) +
    '<div class="card-body">' +
      '<div class="card-top">' +
        '<span class="badge ' + badgeClass + '">' + catLabel + '</span>' +
        juegoTag +
        affiliateTag +
      '</div>' +
      '<h3 class="card-title">' + post.titulo + '</h3>' +
      '<p class="card-excerpt">' + post.extracto + '</p>' +
      '<span class="card-date">' + post.fechaDisplay + '</span>' +
    '</div>' +
  '</a>';
}

// ── Render hero ───────────────────────────────────────────────────────────────

function renderHero(post) {
  const el = document.getElementById('hero-content');
  if (!el) return;

  // Apply post image as hero background (JPGs only, not logos)
  if (post.imagen && !post.logo && !/\.png$/i.test(post.imagen)) {
    const heroSection = el.closest('.hero');
    if (heroSection) {
      const src = /^https?:\/\//.test(post.imagen) ? post.imagen : PATH_PREFIX + post.imagen;
      heroSection.style.backgroundImage =
        'linear-gradient(to right, rgba(13,13,15,0.97) 30%, rgba(13,13,15,0.78) 58%, rgba(13,13,15,0.25) 100%), url(' + src + ')';
      heroSection.style.backgroundSize = '100% 100%, cover';
      heroSection.style.backgroundPosition = '0 0, center';
    }
  }

  const link       = PATH_PREFIX + post.archivo;
  const badgeClass = getBadgeClass(post.categoria);
  const catLabel   = getCategoryLabel(post.categoria);
  const juegoTag   = post.juegoDisplay
    ? '<span class="badge badge-game">' + post.juegoDisplay + '</span>'
    : '';
  
  const affiliateBtn = post.afiliado
    ? '<a href="' + post.afiliado.link + '" target="_blank" rel="noopener" class="btn-affiliate">' + post.afiliado.txt + '</a>'
    : '';

  el.innerHTML =
    '<p class="hero-label">Destacado</p>' +
    '<h2 class="hero-title">' + post.titulo + '</h2>' +
    '<p class="hero-excerpt">' + post.extracto + '</p>' +
    '<div class="hero-meta">' +
      '<div class="hero-btns">' +
        '<a href="' + link + '" class="btn-primary">Leer artículo</a>' +
        affiliateBtn +
      '</div>' +
      '<div class="hero-badges">' +
        '<span class="badge ' + badgeClass + '">' + catLabel + '</span>' +
        juegoTag +
        '<span class="hero-date">' + post.fechaDisplay + '</span>' +
      '</div>' +
    '</div>';
}

// ── Banner de afiliado para el final de los posts ─────────────────────────────

function initAffiliateBanner(postId) {
  const post = POSTS.find(function(p) { return p.id === postId; });
  if (!post || !post.afiliado) return;

  const body = document.querySelector('.post-body');
  if (!body) return;

  const banner = document.createElement('div');
  banner.className = 'affiliate-banner ' + (post.afiliado.tienda || '');
  banner.innerHTML = 
    '<div class="aff-icon">🛒</div>' +
    '<div class="aff-content">' +
      '<p class="aff-title">¿Buscás este producto?</p>' +
      '<p class="aff-text">Lo encontramos al mejor precio para vos.</p>' +
    '</div>' +
    '<a href="' + post.afiliado.link + '" target="_blank" rel="noopener" class="btn-affiliate-banner">' + 
      post.afiliado.txt + 
    '</a>';
  
  body.appendChild(banner);
}

// ── Render cards into a container ─────────────────────────────────────────────

function renderCardsInto(containerId, posts) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!posts || posts.length === 0) {
    el.innerHTML = '<p class="empty-state">No hay artículos todavía. Volvé pronto.</p>';
    return;
  }

  el.innerHTML = posts.map(renderPostCard).join('');
}

// ── Paginación / "Cargar más" ──────────────────────────────────────────────────

var _paginacion = { posts: [], visible: 0, paso: 8, containerId: '' };

function _removeLoadMoreBtn() {
  var w = document.getElementById('load-more-wrapper');
  if (w) w.remove();
}

function _updateLoadMoreBtn() {
  var quedan = _paginacion.posts.length - _paginacion.visible;
  var existing = document.getElementById('load-more-wrapper');

  if (quedan <= 0) {
    _removeLoadMoreBtn();
    return;
  }

  if (!existing) {
    var wrapper = document.createElement('div');
    wrapper.id = 'load-more-wrapper';
    wrapper.className = 'load-more-wrapper';
    wrapper.innerHTML =
      '<button class="btn-load-more" id="load-more-btn">' +
        'Cargar más <span class="load-more-count">(' + quedan + ' restantes)</span>' +
      '</button>';
    var container = document.getElementById(_paginacion.containerId);
    if (container && container.parentNode) {
      container.parentNode.insertBefore(wrapper, container.nextSibling);
    }
    document.getElementById('load-more-btn').addEventListener('click', _loadMore);
  } else {
    var countSpan = existing.querySelector('.load-more-count');
    if (countSpan) countSpan.textContent = '(' + quedan + ' restantes)';
  }
}

function _loadMore() {
  var nextCount = Math.min(
    _paginacion.visible + _paginacion.paso,
    _paginacion.posts.length
  );
  var el = document.getElementById(_paginacion.containerId);
  if (!el) return;

  // Append only the new cards (no re-render all)
  var newCards = _paginacion.posts.slice(_paginacion.visible, nextCount);
  el.insertAdjacentHTML('beforeend', newCards.map(renderPostCard).join(''));
  _paginacion.visible = nextCount;
  _updateLoadMoreBtn();
}

function renderCardsLimited(containerId, posts, limit) {
  var el = document.getElementById(containerId);
  if (!el) return;

  _removeLoadMoreBtn();
  _paginacion = { posts: posts, visible: limit, paso: limit, containerId: containerId };

  if (!posts || posts.length === 0) {
    el.innerHTML = '<p class="empty-state">No hay artículos todavía. Volvé pronto.</p>';
    return;
  }

  el.innerHTML = posts.slice(0, limit).map(renderPostCard).join('');
  _updateLoadMoreBtn();
}

// ── Posts relacionados ────────────────────────────────────────────────────────

function renderRelatedPosts(currentId, categoria) {
  const el = document.getElementById('related-posts');
  if (!el) return;

  const related = getSortedPosts()
    .filter(function (p) { return p.id !== currentId && p.categoria === categoria; })
    .slice(0, 3);

  if (related.length === 0) {
    el.style.display = 'none';
    return;
  }

  el.innerHTML =
    '<p class="related-posts-title">También te puede interesar</p>' +
    '<div class="related-grid">' +
      related.map(renderPostCard).join('') +
    '</div>';
}

// ── Sorted / filtered helpers ─────────────────────────────────────────────────

function getSortedPosts() {
  return [...POSTS].sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
}

function getPostsByCategory(categoria) {
  return getSortedPosts().filter(function (p) { return p.categoria === categoria; });
}

// ── Aplicar búsqueda y filtros ────────────────────────────────────────────────

function applyFilters() {
  let posts = getSortedPosts().filter(function (p) {
    return _categorias.includes(p.categoria);
  });

  if (_gameFilter) {
    posts = posts.filter(function (p) { return p.juego === _gameFilter; });
  }

  if (_tagFilter) {
    posts = posts.filter(function (p) {
      return p.tags && p.tags.includes(_tagFilter);
    });
  }

  if (_searchQuery) {
    posts = posts.filter(function (p) {
      return (
        p.titulo.toLowerCase().includes(_searchQuery) ||
        p.extracto.toLowerCase().includes(_searchQuery) ||
        (p.tags && p.tags.some(function (t) { return t.includes(_searchQuery); })) ||
        (p.juegoDisplay && p.juegoDisplay.toLowerCase().includes(_searchQuery))
      );
    });
  }

  // Si hay búsqueda activa o filtro, mostrar todos los resultados sin paginación
  // (son pocos y el usuario está buscando algo específico)
  if (_searchQuery || _gameFilter || _tagFilter) {
    renderCardsInto('posts-container', posts);
  } else {
    renderCardsLimited('posts-container', posts, 8);
  }

  const counter = document.getElementById('results-count');
  if (counter) {
    counter.textContent = posts.length === 1 ? '1 resultado' : posts.length + ' resultados';
    counter.style.display = (_searchQuery || _gameFilter || _tagFilter) ? 'block' : 'none';
  }
}

// ── Renderizar botones de filtro por juego ────────────────────────────────────

function renderGameFilters() {
  const container = document.getElementById('game-filters');
  if (!container) return;

  const allPosts = getSortedPosts().filter(function (p) {
    return _categorias.includes(p.categoria) && p.juegoDisplay;
  });

  const seen = {};
  const games = [];
  allPosts.forEach(function (p) {
    if (!seen[p.juego]) {
      seen[p.juego] = true;
      games.push({ juego: p.juego, juegoDisplay: p.juegoDisplay });
    }
  });

  if (games.length === 0) { container.style.display = 'none'; return; }

  const btns = ['<button class="filter-btn active" data-game="" data-cat-filter="">Todos</button>'];
  
  // Si la categoría patch-notes está activa (ej. en Gaming), agregar un botón para ver solo parches
  if (_categorias.includes('patch-notes')) {
    btns.push('<button class="filter-btn" data-game="" data-cat-filter="patch-notes">Solo Parches</button>');
  }

  games.forEach(function (g) {
    btns.push('<button class="filter-btn" data-game="' + g.juego + '" data-cat-filter="">' + g.juegoDisplay + '</button>');
  });

  container.innerHTML = btns.join('');

  container.querySelectorAll('.filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      container.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
      this.classList.add('active');
      
      _gameFilter = this.dataset.game;
      _tagFilter  = '';
      
      // Si el botón tiene un filtro de categoría específico (como "Solo Parches")
      if (this.dataset.catFilter) {
        _categorias = [this.dataset.catFilter];
      } else {
        // Restaurar categorías originales de la página (ej. gaming + patch-notes)
        // Esto asume que si no hay filtro de categoría, volvemos al estado inicial
        if (window.location.pathname.includes('gaming.html')) {
          _categorias = ['gaming', 'patch-notes'];
        }
      }
      
      applyFilters();
    });
  });
}

// ── Page init functions ───────────────────────────────────────────────────────

function initHomePage() {
  var sorted = getSortedPosts();
  if (sorted.length > 0) renderHero(sorted[0]);
  renderCardsLimited('latest-container', sorted.slice(1), 6);
}

function initCategoryPage(categoria) {
  _categorias  = Array.isArray(categoria) ? categoria : [categoria];
  _searchQuery = '';
  _gameFilter  = '';

  // Leer tag desde URL param (?tag=xxx)
  const params = new URLSearchParams(window.location.search);
  _tagFilter = params.get('tag') || '';

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    // Si venimos con un tag, ponerlo en el input (opcional, pero ayuda al usuario)
    if (_tagFilter) {
      searchInput.placeholder = 'Filtrando por tag: ' + _tagFilter;
    }

    searchInput.addEventListener('input', function () {
      _searchQuery = this.value.toLowerCase().trim();
      
      // Si el usuario escribe, desactivamos el filtro de juego por ID
      // para que la búsqueda sea global en la categoría
      if (_searchQuery.length > 0 && _gameFilter) {
        _gameFilter = '';
        const gameBtns = document.querySelectorAll('#game-filters .filter-btn');
        gameBtns.forEach(function(b) {
          b.classList.toggle('active', b.dataset.game === '');
        });
      }
      
      applyFilters();
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { 
        this.value = ''; 
        _searchQuery = ''; 
        _tagFilter = ''; // Al escapar, limpiamos también el tag de la URL
        this.placeholder = 'Buscar artículos...';
        applyFilters(); 
      }
    });
  }

  renderGameFilters();
  applyFilters();

  // Si hay tag activo, mostrar indicador
  if (_tagFilter) {
    const counter = document.getElementById('results-count');
    if (counter) {
      counter.textContent = 'Tag: ' + _tagFilter;
      counter.style.display = 'block';
    }
  }
}

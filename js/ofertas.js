// ═══════════════════════════════════════════════════════════════════
// OFERTAS — Render de ofertas de afiliados + tracking de clicks (GA4)
// Usa las clases .game-deals-grid / .game-deal-card ya existentes en style.css
// ═══════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var STORE_LABELS = {
    mercadolibre: 'Mercado Libre',
    amazon: 'Amazon',
    steam: 'Steam',
    epic: 'Epic Games'
  };

  var CAT_LABELS = {
    perifericos: 'Periféricos',
    componentes: 'Componentes',
    consolas: 'Consolas',
    monitores: 'Monitores',
    sillas: 'Sillas',
    otros: 'Otros'
  };

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  // Tracking: cada click en una oferta dispara un evento GA4.
  // Después lo ves en GA4 → Informes → Eventos → affiliate_click
  // (y se puede sumar como tab al admin dashboard).
  window.trackDealClick = function (id, titulo, tienda) {
    if (typeof gtag === 'function') {
      gtag('event', 'affiliate_click', {
        deal_id: id,
        deal_title: titulo,
        store: tienda,
        page: window.location.pathname
      });
    }
  };

  function renderDealCard(o) {
    var pricing = '';
    if (o.descuento) {
      pricing += '<span class="game-discount-badge">' + esc(o.descuento) + '</span>';
    }
    if (o.precioAnterior) {
      pricing += '<span class="deal-price-old" style="text-decoration:line-through;color:var(--text-secondary);font-size:0.85rem;">' + esc(o.precioAnterior) + '</span>';
    }
    pricing += '<span class="deal-price" style="font-family:\'Rajdhani\',sans-serif;font-weight:700;font-size:1.15rem;color:var(--text-primary);">' + esc(o.precio) + '</span>';

    var destacadaStyle = o.destacada ? ' style="border-color:var(--accent);"' : '';
    var storeLabel = STORE_LABELS[o.tienda] || o.tienda;

    return (
      '<a class="game-deal-card" href="' + esc(o.url) + '" target="_blank" rel="noopener sponsored"' +
        destacadaStyle +
        ' onclick="trackDealClick(\'' + esc(o.id) + '\',\'' + esc(o.titulo).replace(/'/g, "\\'") + '\',\'' + esc(o.tienda) + '\')">' +
        '<img src="' + esc(o.imagen) + '" alt="' + esc(o.titulo) + '" loading="lazy" onerror="this.style.display=\'none\'">' +
        '<div class="game-deal-info">' +
          '<span class="badge badge-affiliate">' + esc(storeLabel) + '</span>' +
          '<h3 class="game-deal-title">' + esc(o.titulo) + '</h3>' +
          '<p class="game-deal-desc">' + esc(o.descripcion) + '</p>' +
          '<div class="game-deal-pricing">' + pricing + '</div>' +
          '<span class="btn-affiliate" style="margin-top:0.5rem;justify-content:center;">Ver en ' + esc(storeLabel) + ' →</span>' +
        '</div>' +
      '</a>'
    );
  }

  function initDealsSection() {
    var container = document.getElementById('deals-container');
    if (!container) return;

    if (typeof OFERTAS === 'undefined') {
      container.innerHTML = '';
      return;
    }

    var activas = OFERTAS.filter(function (o) { return o.activa; });

    // Destacadas primero, después por fecha (más nuevas arriba)
    activas.sort(function (a, b) {
      if (a.destacada !== b.destacada) return a.destacada ? -1 : 1;
      return (b.fechaAgregada || '').localeCompare(a.fechaAgregada || '');
    });

    var section = document.getElementById('deals-section');

    if (activas.length === 0) {
      // Sin ofertas activas: se oculta la sección entera, sin placeholder feo
      if (section) section.style.display = 'none';
      return;
    }

    if (section) section.style.display = '';
    container.innerHTML = activas.map(renderDealCard).join('');

    // Contador y fecha de actualización
    var count = document.getElementById('deals-count');
    if (count) {
      var fechas = activas.map(function (o) { return o.fechaAgregada || ''; }).sort();
      var ultima = fechas[fechas.length - 1];
      count.textContent = activas.length + (activas.length === 1 ? ' oferta activa' : ' ofertas activas') +
        (ultima ? ' — actualizado ' + formatFecha(ultima) : '');
    }
  }

  function formatFecha(iso) {
    var meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    var p = iso.split('-');
    if (p.length !== 3) return iso;
    return parseInt(p[2], 10) + ' de ' + (meses[parseInt(p[1], 10) - 1] || p[1]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDealsSection);
  } else {
    initDealsSection();
  }
})();

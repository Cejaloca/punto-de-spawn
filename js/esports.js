// ============================================================
// js/esports.js — Lógica de la página de Esports
// ============================================================

// ── CONFIG PANDASCORE (opcional) ────────────────────────────
// Registrate gratis en pandascore.co y pega tu token acá
// para traer partidos en tiempo real automáticamente.
// Si está vacío, usa solo los datos de data/esports.js
const PANDASCORE_TOKEN = '';

// Mapeo de juego → id de PandaScore
const PS_VIDEOGAME = {
  dota2: 'dota-2',
  cs2: 'cs-go',
  lol: 'league-of-legends',
  valorant: 'valorant',
  hearthstone: 'hearthstone'
};

// ── ESTADO GLOBAL ───────────────────────────────────────────
let filtroActivo = 'todos';
let canalActivo = null;
let torneosData = [];

// ── HELPERS ─────────────────────────────────────────────────
function formatFecha(iso) {
  const [y, m, d] = iso.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${meses[parseInt(m)-1]} ${y}`;
}

function getEstadoHoy(torneo) {
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const inicio = new Date(torneo.fechaInicio + 'T00:00:00');
  const fin    = new Date(torneo.fechaFin    + 'T23:59:59');
  if (hoy >= inicio && hoy <= fin) return 'en-curso';
  if (hoy < inicio) return 'proximo';
  return 'finalizado';
}

function estadoBadge(estado) {
  if (estado === 'en-curso') {
    return `<span class="es-badge es-badge-live"><span class="es-pulse"></span>EN VIVO</span>`;
  }
  if (estado === 'proximo') {
    return `<span class="es-badge es-badge-upcoming">PRÓXIMO</span>`;
  }
  return `<span class="es-badge es-badge-done">FINALIZADO</span>`;
}

function juegoLabel(juego) {
  return ESPORTS_CANALES[juego]?.label || juego;
}

function juegoColor(juego) {
  return ESPORTS_CANALES[juego]?.color || '#888';
}

// ── TWITCH EMBED ─────────────────────────────────────────────
function cargarEmbed(canal, nombreTorneo) {
  if (canalActivo === canal) return;
  canalActivo = canal;

  const wrap = document.getElementById('es-player-wrap');
  const info = document.getElementById('es-embed-info');

  wrap.innerHTML = `
    <iframe
      src="https://player.twitch.tv/?channel=${canal}&parent=puntodespawn.com&autoplay=true&muted=false"
      width="100%" height="100%"
      allowfullscreen
      style="border:0; display:block; width:100%; height:100%;"
    ></iframe>`;

  if (info) {
    info.textContent = `▶ Viendo: ${canal} ${nombreTorneo ? '— '+nombreTorneo : ''}`;
  }

  // Highlight botón activo
  document.querySelectorAll('.es-canal-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.canal === canal);
  });
}

function mostrarPlaceholderEmbed() {
  const wrap = document.getElementById('es-player-wrap');
  wrap.innerHTML = `
    <div class="es-player-placeholder">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.3"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      <p>Seleccioná un torneo o juego para ver el stream en vivo</p>
    </div>`;
}

// ── TARJETAS DE TORNEOS ──────────────────────────────────────
function renderTorneos(lista) {
  const grid = document.getElementById('es-torneos-grid');
  if (!lista || !lista.length) {
    grid.innerHTML = `<p class="es-empty">No hay torneos en esta categoría por el momento.</p>`;
    return;
  }

  grid.innerHTML = lista.map(t => {
    const estado = getEstadoHoy(t);
    const color  = juegoColor(t.juego);
    const canal  = t.twitch || ESPORTS_CANALES[t.juego]?.twitch || '';

    return `
    <div class="es-torneo-card" data-juego="${t.juego}" data-estado="${estado}">
      <div class="es-torneo-header" style="border-top: 3px solid ${color}">
        <div class="es-torneo-meta">
          <span class="es-juego-chip" style="color:${color}; border-color:${color}">${juegoLabel(t.juego)}</span>
          ${estadoBadge(estado)}
        </div>
        <h3 class="es-torneo-nombre">${t.nombre}</h3>
        <p class="es-torneo-loc">📍 ${t.ubicacion}</p>
      </div>
      <div class="es-torneo-body">
        <p class="es-torneo-desc">${t.descripcion}</p>
        <div class="es-torneo-stats">
          <div class="es-stat"><span class="es-stat-label">Equipos</span><span class="es-stat-val">${t.equipos}</span></div>
          <div class="es-stat"><span class="es-stat-label">Premios</span><span class="es-stat-val">${t.premios}</span></div>
          <div class="es-stat"><span class="es-stat-label">Inicio</span><span class="es-stat-val">${formatFecha(t.fechaInicio)}</span></div>
          <div class="es-stat"><span class="es-stat-label">Fin</span><span class="es-stat-val">${formatFecha(t.fechaFin)}</span></div>
        </div>
      </div>
      <div class="es-torneo-footer">
        ${canal ? `<button class="es-watch-btn" onclick="cargarEmbed('${canal}','${t.nombre.replace(/'/g,'')}')" ${estado==='finalizado'?'disabled':''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16H3V4h18v14z"/><polygon points="10,8 16,12 10,16"/></svg>
          Ver en vivo
        </button>` : ''}
        <a href="${t.liquipedia}" target="_blank" rel="noopener" class="es-liq-btn">
          Liquipedia →
        </a>
      </div>
    </div>`;
  }).join('');
}

// ── FILTRO POR JUEGO ─────────────────────────────────────────
function aplicarFiltro(juego) {
  filtroActivo = juego;

  document.querySelectorAll('.es-game-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.juego === juego);
  });

  const filtrados = juego === 'todos'
    ? torneosData
    : torneosData.filter(t => t.juego === juego);

  renderTorneos(filtrados);
}

// ── PANDASCORE FETCH (opcional) ──────────────────────────────
async function fetchPandaScore() {
  if (!PANDASCORE_TOKEN) return null;

  const juegos = Object.values(PS_VIDEOGAME).join(',');
  const url = `https://api.pandascore.co/matches/upcoming?videogame=${encodeURIComponent(juegos)}&per_page=20&sort=scheduled_at&token=${PANDASCORE_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch(e) {
    console.warn('[Esports] PandaScore no disponible:', e.message);
    return null;
  }
}

function renderPartidosPS(partidos) {
  const sec = document.getElementById('es-partidos-section');
  const grid = document.getElementById('es-partidos-grid');
  if (!partidos || !partidos.length) { sec.style.display = 'none'; return; }

  sec.style.display = 'block';

  const juegoReverso = {};
  Object.entries(PS_VIDEOGAME).forEach(([k,v]) => { juegoReverso[v] = k; });

  grid.innerHTML = partidos.slice(0,12).map(m => {
    const jugA = m.opponents[0]?.opponent?.name || 'TBD';
    const jugB = m.opponents[1]?.opponent?.name || 'TBD';
    const fecha = m.scheduled_at ? new Date(m.scheduled_at).toLocaleString('es-AR', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'TBD';
    const juego = juegoReverso[m.videogame?.slug] || 'lol';
    const color = juegoColor(juego);

    return `
    <div class="es-partido-card">
      <div class="es-partido-juego" style="color:${color}">${juegoLabel(juego)}</div>
      <div class="es-partido-fecha">${fecha}</div>
      <div class="es-partido-match">
        <span class="es-partido-team">${jugA}</span>
        <span class="es-partido-vs">VS</span>
        <span class="es-partido-team">${jugB}</span>
      </div>
      <div class="es-partido-liga">${m.league?.name || ''} — ${m.serie?.full_name || ''}</div>
    </div>`;
  }).join('');
}

// ── INIT ─────────────────────────────────────────────────────
async function initEsports() {
  // Recalcular estado en base a hoy
  torneosData = ESPORTS_TORNEOS.map(t => ({
    ...t,
    estadoCalculado: getEstadoHoy(t)
  }));

  // Ordenar: en-curso → proximo → finalizado
  const orden = { 'en-curso': 0, 'proximo': 1, 'finalizado': 2 };
  torneosData.sort((a, b) => orden[a.estadoCalculado] - orden[b.estadoCalculado]);

  renderTorneos(torneosData);

  // Canales rápidos (barra de juegos vivos)
  const canalBar = document.getElementById('es-canal-bar');
  if (canalBar) {
    canalBar.innerHTML = Object.entries(ESPORTS_CANALES).map(([key, c]) => `
      <button class="es-canal-btn" data-canal="${c.twitch}" data-juego="${key}"
        onclick="cargarEmbed('${c.twitch}', '${c.label}'); aplicarFiltro('${key}')">
        ${c.label}
      </button>
    `).join('');
  }

  // Tabs de filtro
  document.querySelectorAll('.es-game-tab').forEach(tab => {
    tab.addEventListener('click', () => aplicarFiltro(tab.dataset.juego));
  });

  // PandaScore (si hay clave)
  const psData = await fetchPandaScore();
  if (psData) renderPartidosPS(psData);

  mostrarPlaceholderEmbed();
}

document.addEventListener('DOMContentLoaded', initEsports);

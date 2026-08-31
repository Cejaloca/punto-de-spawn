// ============================================================
// js/esports.js — Lógica de la página de Esports
// ============================================================

// ── CONFIG LOL ESPORTS API (automático, sin registro) ───────
// API pública que usa lolesports.com internamente. CORS abierto,
// no requiere cuenta ni token propio — usa la clave pública
// que Riot expone en su propio frontend.
const LOL_API_KEY = '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z';
const LOL_API_BASE = 'https://esports-api.lolesports.com/persisted/gw';

// Ligas mayores a mostrar (se ignoran ligas regionales menores para no saturar)
const LOL_LEAGUE_IDS = [
  '98767975604431411', // Worlds
  '98767991325878492', // MSI
  '98767991310872058', // LCK
  '98767991302996019', // LEC
  '98767991314006698', // LPL
  '113475181634818701', // LTA Sur
  '113470291645289904', // LTA Norte
  '113475149040947852', // LTA Cross-Conference
  '101382741235120470', // LLA (Latinoamérica)
  '98767991332355509'  // CBLOL
];

// ── ESTADO GLOBAL ───────────────────────────────────────────
let filtroActivo = 'todos';
let canalActivo = null;
let plataformaActiva = null;
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

// ── EMBED (Twitch o Kick) ────────────────────────────────────
function cargarEmbed(canal, nombreTorneo, plataforma) {
  plataforma = plataforma || 'twitch';
  if (canalActivo === canal && plataformaActiva === plataforma) return;
  canalActivo = canal;
  plataformaActiva = plataforma;

  const wrap = document.getElementById('es-player-wrap');
  const info = document.getElementById('es-embed-info');

  const src = plataforma === 'kick'
    ? `https://player.kick.com/${canal}?autoplay=true&muted=false`
    : `https://player.twitch.tv/?channel=${canal}&parent=puntodespawn.com&autoplay=true&muted=false`;

  wrap.innerHTML = `
    <iframe
      src="${src}"
      width="100%" height="100%"
      allowfullscreen
      style="border:0; display:block; width:100%; height:100%;"
    ></iframe>`;

  if (info) {
    const plataformaLabel = plataforma === 'kick' ? 'Kick' : 'Twitch';
    info.textContent = `▶ Viendo en ${plataformaLabel}: ${canal} ${nombreTorneo ? '— '+nombreTorneo : ''}`;
  }

  // Highlight botón activo
  document.querySelectorAll('.es-canal-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.canal === canal && b.dataset.plataforma === plataforma);
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
    const canalKick = t.kick || ESPORTS_CANALES[t.juego]?.kick || '';
    const nombreEsc = t.nombre.replace(/'/g,'');

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
        ${canal ? `<button class="es-watch-btn" onclick="cargarEmbed('${canal}','${nombreEsc}','twitch')" ${estado==='finalizado'?'disabled':''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M21 2H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16H3V4h18v14z"/><polygon points="10,8 16,12 10,16"/></svg>
          Ver en vivo
        </button>` : ''}
        ${canalKick ? `<button class="es-watch-btn es-watch-btn-kick" onclick="cargarEmbed('${canalKick}','${nombreEsc}','kick')" ${estado==='finalizado'?'disabled':''}>
          Ver en Kick
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

// ── LOL ESPORTS API (automático) ─────────────────────────────
async function lolFetch(endpoint, params) {
  const url = `${LOL_API_BASE}/${endpoint}?${new URLSearchParams(params).toString()}`;
  try {
    const res = await fetch(url, { headers: { 'x-api-key': LOL_API_KEY } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn(`[Esports] LoL Esports API (${endpoint}) no disponible:`, e.message);
    return null;
  }
}

// Partidos en vivo ahora mismo (si hay, se pueden auto-embeber)
async function fetchLolLive() {
  const data = await lolFetch('getLive', { hl: 'es-MX' });
  return data?.data?.schedule?.events || [];
}

// Próximos partidos de las ligas mayores
async function fetchLolSchedule() {
  const data = await lolFetch('getSchedule', {
    hl: 'es-MX',
    leagueId: LOL_LEAGUE_IDS.join(',')
  });
  const events = data?.data?.schedule?.events || [];
  return events
    .filter(e => e.state === 'unstarted')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 12);
}

function formatFechaLol(iso) {
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit'
  });
}

function renderLolFixture(events, liveIds) {
  const sec = document.getElementById('es-partidos-section');
  const grid = document.getElementById('es-partidos-grid');
  if (!sec || !grid) return;

  if (!events || !events.length) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';

  grid.innerHTML = events.map(e => {
    const teams = e.match?.teams || [];
    const t1 = teams[0] || {};
    const t2 = teams[1] || {};
    const enVivo = liveIds.has(e.match?.id);

    return `
    <div class="es-partido-card">
      <div class="es-partido-juego" style="color:${juegoColor('lol')}; display:flex; align-items:center; justify-content:space-between;">
        <span>${e.league?.name || 'LoL'}</span>
        ${enVivo ? '<span class="es-badge es-badge-live"><span class="es-pulse"></span>EN VIVO</span>' : ''}
      </div>
      <div class="es-partido-fecha">${e.blockName || ''} — ${formatFechaLol(e.startTime)}</div>
      <div class="es-partido-match">
        ${t1.image ? `<img src="${t1.image}" alt="${t1.code||''}" style="width:24px;height:24px;object-fit:contain;">` : ''}
        <span class="es-partido-team">${t1.code || t1.name || 'TBD'}</span>
        <span class="es-partido-vs">VS</span>
        <span class="es-partido-team">${t2.code || t2.name || 'TBD'}</span>
        ${t2.image ? `<img src="${t2.image}" alt="${t2.code||''}" style="width:24px;height:24px;object-fit:contain;">` : ''}
      </div>
      ${enVivo ? `<div style="text-align:center; margin-top:0.5rem;">
        <button class="es-watch-btn" onclick="cargarEmbed('riotgames','${(e.league?.name||'LoL').replace(/'/g,'')}')">Ver en vivo</button>
      </div>` : ''}
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
      <button class="es-canal-btn" data-canal="${c.twitch}" data-plataforma="twitch" data-juego="${key}"
        onclick="cargarEmbed('${c.twitch}', '${c.label}', 'twitch'); aplicarFiltro('${key}')">
        ${c.label}
      </button>
    `).join('');
  }

  // Tabs de filtro
  document.querySelectorAll('.es-game-tab').forEach(tab => {
    tab.addEventListener('click', () => aplicarFiltro(tab.dataset.juego));
  });

  mostrarPlaceholderEmbed();

  // LoL Esports API — fixture automático + detección de partidos en vivo
  const [liveEvents, schedule] = await Promise.all([
    fetchLolLive(),
    fetchLolSchedule()
  ]);

  const liveIds = new Set(liveEvents.map(e => e.match?.id).filter(Boolean));
  renderLolFixture(schedule, liveIds);

  // Si hay un partido de LoL en vivo ahora, cargarlo automáticamente en el player
  if (liveEvents.length > 0) {
    cargarEmbed('riotgames', liveEvents[0].league?.name || 'LoL en vivo');
  }
}

document.addEventListener('DOMContentLoaded', initEsports);

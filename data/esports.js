// ============================================================
// data/esports.js — Datos de torneos de Esports
// Curado a mano, con foco en Argentina/Latam donde hay gancho local.
// Todas las fechas verificadas por research (agosto 2026). Actualizar
// cuando arranque/termine un torneo, o cuando salgan fechas nuevas.
// ============================================================

// Canales de Twitch (y Kick, donde aplica) por juego — fallback general,
// no ligado a un torneo puntual. Verificados por research en agosto 2026:
// - CS2 (blastpremier/esl_csgo) tiene simulcast confirmado en Kick.
// - El resto son los canales oficiales de Twitch de cada organizador.
const ESPORTS_CANALES = {
  dota2: {
    label: 'Dota 2',
    twitch: 'dota2ti',
    twitchAlt: 'pgl_dota2',
    color: '#c23b22'
  },
  cs2: {
    label: 'CS2',
    twitch: 'blastpremier',
    twitchAlt: 'esl_csgo',
    kick: 'blastpremier',
    color: '#ff6b35'
  },
  lol: {
    label: 'League of Legends',
    twitch: 'lck',
    twitchAlt: 'riotgames',
    color: '#c89b3c'
  },
  valorant: {
    label: 'VALORANT',
    twitch: 'valorant_americas',
    twitchAlt: 'valorant',
    color: '#ff4655'
  },
  hearthstone: {
    label: 'Hearthstone',
    twitch: 'playhearthstone',
    twitchAlt: 'blizzard',
    color: '#c97d0e'
  }
};

// Torneos — lista curada, no exhaustiva. Priorizamos gancho argentino/latam
// (Leviatán, ShindeN, 9z/Bestia/CONTER) y un torneo global de referencia por juego.
const ESPORTS_TORNEOS = [
  {
    id: 'vct-americas-2026-stage2-playoffs',
    nombre: 'VCT Americas 2026 — Playoffs: Leviatán vs MIBR',
    juego: 'valorant',
    fechaInicio: '2026-08-27',
    fechaFin: '2026-08-27',
    ubicacion: 'Online',
    premios: 'Clasificación a VCT Champions',
    equipos: 2,
    descripcion: 'Leviatán se mide con MIBR en la primera ronda de playoffs de VCT Americas Stage 2. Se enfrentaron 4 veces esta temporada, 2-2. Leviatán llega como favorito por su forma en fase de grupos.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Valorant_Champions_Tour_logo.png',
    liquipedia: 'https://liquipedia.net/valorant/VCT/2026/Americas/Stage_2',
    twitch: 'valorant_americas'
  },
  {
    id: 'cblol-2026-split1-leviatan',
    nombre: 'CBLOL 2026 Split 1 — Leviatán entre los ocho equipos',
    juego: 'lol',
    fechaInicio: '2026-08-01',
    fechaFin: '2026-09-20',
    ubicacion: 'Riot Games Arena, São Paulo',
    premios: 'Clasificación a Playoffs + Worlds',
    equipos: 8,
    descripcion: 'Leviatán, la organización argentina, compite en CBLOL 2026 Split 1 junto a Fluxo, FURIA, Keyd Stars, LOUD, paiN Gaming, RED Canids y LOS. Pelean por un lugar en los playoffs y en Worlds.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/CBLOL_logo.png',
    liquipedia: 'https://liquipedia.net/leagueoflegends/CBLOL/2026/Split_1',
    twitch: 'cblol'
  },
  {
    id: 'esl-pro-league-s24-shinden',
    nombre: 'ESL Pro League Season 24 — ShindeN clasificó',
    juego: 'cs2',
    fechaInicio: '2026-10-03',
    fechaFin: '2026-10-11',
    ubicacion: 'Spodek Arena, Katowice, Polonia',
    premios: '$1,000,000',
    equipos: 16,
    descripcion: 'ShindeN, la organización argentina fundada por Lit Killah y Spreen, clasificó a la EPL S24 tras ganar la ESL Challenger League Finals de Sudamérica. Debutan en el torneo S-Tier más importante del semestre.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Counter_Strike_2_Logo.png',
    liquipedia: 'https://liquipedia.net/counterstrike/ESL/Pro_League/Season_24',
    twitch: 'esl_csgo',
    kick: 'eslcs'
  },
  {
    id: 'blast-open-porto-2026-s2',
    nombre: 'BLAST Open Porto 2026',
    juego: 'cs2',
    fechaInicio: '2026-08-26',
    fechaFin: '2026-09-06',
    ubicacion: 'Copenhague (grupos) → Super Bock Arena, Porto (playoffs)',
    premios: '$1,100,000',
    equipos: 16,
    descripcion: 'Fase de grupos en BLAST Studios (Copenhague) hasta el 31/8, con playoffs presenciales en Porto del 4 al 6 de septiembre. Incluye a Spirit, Falcons, FURIA, Vitality y MOUZ, entre los mejores del ranking Valve.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Counter_Strike_2_Logo.png',
    liquipedia: 'https://liquipedia.net/counterstrike/BLAST/Open/2026/Porto',
    twitch: 'blastpremier',
    kick: 'blastpremier'
  },
  {
    id: 'conter-argentina-2026',
    nombre: 'CONTER — El circuito argentino de CS2 camino al Major 2027',
    juego: 'cs2',
    fechaInicio: '2026-01-29',
    fechaFin: '2026-12-20',
    ubicacion: 'Buenos Aires, Argentina',
    premios: 'Puntos de ranking Valve',
    equipos: 16,
    descripcion: 'Primer circuito profesional de CS2 en Argentina (FiReSPORTS), con 9z y Bestia entre los equipos top. Reparte puntos oficiales de cara al Major de Buenos Aires 2027 — el primero que se juega en el país.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Counter_Strike_2_Logo.png',
    liquipedia: 'https://liquipedia.net/counterstrike/Conter/2026',
    twitch: 'fireleaguetv'
  },
  {
    id: 'vct-champions-2026',
    nombre: 'VCT Champions 2026',
    juego: 'valorant',
    fechaInicio: '2026-09-24',
    fechaFin: '2026-10-18',
    ubicacion: 'Shanghái, China',
    premios: '$2,250,000',
    equipos: 16,
    descripcion: 'El cierre de temporada de VALORANT. Primera vez que Champions se juega en China. 16 equipos de todas las regiones pelean por el título mundial.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/Valorant_Champions_Tour_logo.png',
    liquipedia: 'https://liquipedia.net/valorant/VCT/2026/Champions',
    twitch: 'valorant'
  },
  {
    id: 'lol-worlds-2026',
    nombre: 'Worlds 2026 — LoL World Championship',
    juego: 'lol',
    fechaInicio: '2026-10-15',
    fechaFin: '2026-11-14',
    ubicacion: 'Los Ángeles → Allen, TX → Nueva York (final en Barclays Center)',
    premios: '$2,225,000+',
    equipos: 22,
    descripcion: 'El Mundial de League of Legends vuelve a Norteamérica. Play-Ins en Los Ángeles, Swiss Stage en Allen (Texas), y la final el 14 de noviembre en el Barclays Center de Brooklyn.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/League_of_Legends_2019_vector.svg',
    liquipedia: 'https://liquipedia.net/leagueoflegends/World_Championship/2026',
    twitch: 'riotgames'
  },
  {
    id: 'hs-world-championship-2026',
    nombre: 'Hearthstone World Championship 2026',
    juego: 'hearthstone',
    fechaInicio: '2026-09-12',
    fechaFin: '2026-09-13',
    ubicacion: 'Anaheim, California',
    premios: '$500,000',
    equipos: 16,
    descripcion: 'Los 16 mejores jugadores de Hearthstone del año, incluyendo el top 3 de cada Masters Tour, compiten por el título mundial. Se corona campeón el domingo 13 de septiembre.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Gamescom_2015_-_Hearthstone_tournament.jpg',
    liquipedia: 'https://liquipedia.net/hearthstone/Hearthstone_World_Championship/2026',
    twitch: 'playhearthstone'
  },
  {
    id: 'pgl-wallachia-s9-dota2',
    nombre: 'PGL Wallachia Season 9',
    juego: 'dota2',
    fechaInicio: '2026-09-17',
    fechaFin: '2026-09-27',
    ubicacion: 'Por confirmar',
    premios: 'Por confirmar',
    equipos: 8,
    descripcion: 'Uno de los torneos Tier 1 de Dota 2 post-TI 2026 (que se jugó en agosto en Shanghái). Los equipos top se reacomodan de cara a la nueva temporada competitiva.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Dota_logo_without_bee.png',
    liquipedia: 'https://liquipedia.net/dota2/PGL/Wallachia/Season_9',
    twitch: 'pgl_dota2'
  }
];

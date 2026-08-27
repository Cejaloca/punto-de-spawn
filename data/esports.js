// ============================================================
// data/esports.js — Datos de torneos de Esports
// Actualizar este archivo con nuevos torneos manualmente,
// o conectar PandaScore API (free tier) desde js/esports.js
// ============================================================

// Canales de Twitch y YouTube por juego
const ESPORTS_CANALES = {
  dota2: {
    label: 'Dota 2',
    twitch: 'dota2ti',
    twitchAlt: 'esl_dota2',
    color: '#c23b22',
    icon: '🔴'
  },
  cs2: {
    label: 'CS2',
    twitch: 'blast_cs',
    twitchAlt: 'esl_cs2',
    color: '#ff6b35',
    icon: '🟠'
  },
  lol: {
    label: 'League of Legends',
    twitch: 'lck',
    twitchAlt: 'riotgames',
    color: '#c89b3c',
    icon: '🟡'
  },
  valorant: {
    label: 'VALORANT',
    twitch: 'valorantesports',
    twitchAlt: 'valorant_es',
    color: '#ff4655',
    icon: '🔺'
  },
  hearthstone: {
    label: 'Hearthstone',
    twitch: 'playhearthstone',
    twitchAlt: 'blizzard_esports',
    color: '#c97d0e',
    icon: '🟤'
  }
};

// Torneos — actualizar fechaInicio/fechaFin cuando empiecen nuevos eventos
const ESPORTS_TORNEOS = [
  {
    id: 'vct-champions-2026',
    nombre: 'VCT Champions 2026',
    juego: 'valorant',
    estado: 'en-curso',
    fechaInicio: '2026-08-15',
    fechaFin: '2026-09-07',
    ubicacion: 'Londres, Reino Unido',
    premios: '$2,250,000',
    equipos: 16,
    descripcion: 'El torneo más importante del año para VALORANT. 16 equipos de EMEA, Americas y Pacific pelean por el título mundial en el O2 Arena.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/VALORANT_logo.svg/1200px-VALORANT_logo.svg.png',
    liquipedia: 'https://liquipedia.net/valorant/VCT/2026/Champions',
    twitch: 'valorantesports'
  },
  {
    id: 'lck-summer-2026-playoffs',
    nombre: 'LCK Summer 2026 — Playoffs',
    juego: 'lol',
    estado: 'en-curso',
    fechaInicio: '2026-08-18',
    fechaFin: '2026-09-01',
    ubicacion: 'LoL Park, Seúl',
    premios: 'Clasificación a Worlds',
    equipos: 8,
    descripcion: 'Los playoffs de la Liga Korean Champions determinan cuáles equipos representarán a LCK en el Campeonato Mundial de LoL.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/LCK_2023_logo.svg/1200px-LCK_2023_logo.svg.png',
    liquipedia: 'https://liquipedia.net/leagueoflegends/LCK/2026/Summer/Playoffs',
    twitch: 'lck'
  },
  {
    id: 'esl-one-bangkok-dota2-2026',
    nombre: 'ESL One Bangkok 2026',
    juego: 'dota2',
    estado: 'en-curso',
    fechaInicio: '2026-08-20',
    fechaFin: '2026-08-31',
    ubicacion: 'Bangkok, Tailandia',
    premios: '$500,000',
    equipos: 12,
    descripcion: 'Un Major crucial antes del TI 2026. Los mejores equipos de Dota 2 compiten por puntos DPC y práctica antes del campeonato mundial.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/ESL_Gaming_logo.svg/1200px-ESL_Gaming_logo.svg.png',
    liquipedia: 'https://liquipedia.net/dota2/ESL_One/Bangkok/2026',
    twitch: 'esl_dota2'
  },
  {
    id: 'blast-premier-fall-2026',
    nombre: 'BLAST Premier Fall Groups 2026',
    juego: 'cs2',
    estado: 'proximo',
    fechaInicio: '2026-09-10',
    fechaFin: '2026-09-22',
    ubicacion: 'Online / LAN',
    premios: '$177,500',
    equipos: 12,
    descripcion: 'La etapa de grupos otoñal de BLAST Premier — uno de los circuitos más importantes de CS2. Los mejores equipos del mundo por el clasificatorio.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/BLAST_Premier_logo.png/800px-BLAST_Premier_logo.png',
    liquipedia: 'https://liquipedia.net/counterstrike/BLAST/Premier/2026/Fall',
    twitch: 'blast_cs'
  },
  {
    id: 'lol-worlds-2026',
    nombre: 'Worlds 2026 — LoL World Championship',
    juego: 'lol',
    estado: 'proximo',
    fechaInicio: '2026-10-01',
    fechaFin: '2026-11-08',
    ubicacion: 'Por confirmar',
    premios: '$2,225,000',
    equipos: 22,
    descripcion: 'El Campeonato Mundial de League of Legends. El evento más grande del año reúne a los mejores equipos de LCK, LPL, LEC y LCS.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/League_of_Legends_Worlds_logo.svg/1200px-League_of_Legends_Worlds_logo.svg.png',
    liquipedia: 'https://liquipedia.net/leagueoflegends/World_Championship/2026',
    twitch: 'riotgames'
  },
  {
    id: 'ti2026-dota2',
    nombre: 'The International 2026',
    juego: 'dota2',
    estado: 'proximo',
    fechaInicio: '2026-10-12',
    fechaFin: '2026-10-26',
    ubicacion: 'Por confirmar',
    premios: '$15,000,000+',
    equipos: 18,
    descripcion: 'El torneo más legendario de Dota 2. El prize pool del TI supera los $15M, el más grande del esports. La Gran Final de 2026.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Dota2_International_Logo.png',
    liquipedia: 'https://liquipedia.net/dota2/The_International/2026',
    twitch: 'dota2ti'
  },
  {
    id: 'hs-world-championship-2026',
    nombre: 'Hearthstone World Championship 2026',
    juego: 'hearthstone',
    estado: 'proximo',
    fechaInicio: '2026-11-01',
    fechaFin: '2026-11-03',
    ubicacion: 'BlizzCon 2026',
    premios: '$500,000',
    equipos: 16,
    descripcion: 'Los 16 mejores jugadores de Hearthstone del mundo se reúnen en BlizzCon para competir por el título mundial y el pozo de premios.',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Hearthstone_Logo.png/1200px-Hearthstone_Logo.png',
    liquipedia: 'https://liquipedia.net/hearthstone/World_Championship/2026',
    twitch: 'playhearthstone'
  }
];

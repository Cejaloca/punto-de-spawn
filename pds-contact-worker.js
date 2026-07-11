// ⚠️ Pegá estos valores directamente en el editor de Cloudflare Workers — no commitear
const BOT_TOKEN = 'TU_BOT_TOKEN_AQUI';
const CHAT_ID = 'TU_CHAT_ID_AQUI';

const CORS = {
  'Access-Control-Allow-Origin': 'https://puntodespawn.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { nombre, email, mensaje } = await request.json();

    if (!nombre || !mensaje) {
      return json({ ok: false, error: 'Faltan campos requeridos' }, 400);
    }

    const text =
      `📬 *Nueva consulta — PuntoDeSpawn*\n\n` +
      `👤 *Nombre:* ${nombre}\n` +
      `📧 *Email:* ${email || '—'}\n\n` +
      `💬 *Mensaje:*\n${mensaje}`;

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'Markdown' }),
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) throw new Error('Telegram error: ' + JSON.stringify(tgData));

    return json({ ok: true });

  } catch (e) {
    return json({ ok: false, error: e.message }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

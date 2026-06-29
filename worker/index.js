function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = [
    'https://shuhsukin.github.io',
    'http://localhost',
    'http://127.0.0.1',
  ];
  const allowOrigin = allowed.some((item) => origin.startsWith(item)) ? origin : 'https://shuhsukin.github.io';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(body, status, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json',
    },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(request) });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'method_not_allowed' }, 405, request);
    }

    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return jsonResponse({ ok: false, error: 'not_configured' }, 503, request);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: 'invalid_json' }, 400, request);
    }

    const phone = String(payload.phone || '').trim();
    const name = String(payload.name || '').trim();

    if (!phone || !name) {
      return jsonResponse({ ok: false, error: 'missing_fields' }, 400, request);
    }

    const when = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    const text = [
      '🥛 <b>Новая заявка с сайта Климово</b>',
      '',
      `👤 ${escapeHtml(name)}`,
      `📞 ${escapeHtml(phone)}`,
      `🕐 ${escapeHtml(when)}`,
    ].join('\n');

    const tgResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const tgResult = await tgResponse.json();
    if (!tgResponse.ok || !tgResult.ok) {
      return jsonResponse({ ok: false, error: 'telegram_error' }, 502, request);
    }

    return jsonResponse({ ok: true }, 200, request);
  },
};

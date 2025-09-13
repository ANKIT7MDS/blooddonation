/**
 * Netlify Function: POST /.netlify/functions/send-tg
 * body: { chat_id: "733804072" or "@channelname", text: "message" }
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return { statusCode: 500, body: 'Missing TELEGRAM_BOT_TOKEN' };

    const { chat_id, text } = JSON.parse(event.body || '{}');
    if (!chat_id || !text) return { statusCode: 400, body: 'chat_id and text required' };

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ chat_id, text })
    });
    const body = await r.text();
    return { statusCode: r.ok ? 200 : 500, body };
  } catch (e) {
    return { statusCode: 500, body: String(e) };
  }
};

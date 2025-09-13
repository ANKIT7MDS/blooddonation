// netlify/functions/send-tg.js
const https = require('https');

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };
}

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'Missing TELEGRAM_BOT_TOKEN env var' }) };
    }

    let payload = {};
    try { payload = JSON.parse(event.body || '{}'); }
    catch { return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'Bad JSON body' }) }; }

    const { chat_id, text } = payload;
    if (!chat_id || !text) {
      return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: 'chat_id and text required' }) };
    }

    const data = JSON.stringify({ chat_id, text });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    };

    const body = await new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        let out = '';
        res.on('data', d => out += d);
        res.on('end', () => resolve(out));
      });
      req.on('error', reject);
      req.write(data);
      req.end();
    });

    // Telegram आमतौर पर 200 देता है; body में ok:true/false आता है
    return { statusCode: 200, headers: cors(), body };
  } catch (e) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: String(e) }) };
  }
};

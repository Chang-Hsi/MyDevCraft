// /.netlify/functions/donate-codes
const UPSTREAM = 'https://www.einvoice.nat.gov.tw/portal/ods/api/v1/DonateCodeList';

export async function handler(event) {
  try {
    const qs = event.rawQuery ? `?${event.rawQuery}` : '?limit=10000';
    const url = `${UPSTREAM}${qs}`;

    const resp = await fetch(url, {
      // 關鍵：強制要 JSON，不給 text/html 機會
      headers: {
        'accept': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
        // 有些 WAF/後端會看 Referer
        'referer': 'https://www.einvoice.nat.gov.tw/portal/ods/ODS318E',
        // 保險起見補 UA
        'user-agent': 'Mozilla/5.0 NetlifyFunction'
      },
      redirect: 'follow'
    });

    const contentType = resp.headers.get('content-type') || '';
    const text = await resp.text();

    // 若不小心仍回 HTML（大多是被 SPA/防護牆兜走），直接拋錯，避免前端誤判
    if (!contentType.includes('application/json') || /^\s*<!doctype html/i.test(text)) {
      return {
        statusCode: 502,
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({
          error: 'Upstream returned HTML instead of JSON',
          hint: 'The ODS endpoint sometimes falls back to SPA HTML if headers are not accepted by WAF.'
        })
      };
    }

    // 正常：轉發 JSON，附上 CORS
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',
        'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800'
      },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: String(err?.message || err) })
    };
  }
}

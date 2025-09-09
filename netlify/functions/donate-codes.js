// 代理到財政部開放資料的捐贈碼清單，並加上 CORS 標頭
// 路徑：/.netlify/functions/donate-codes

const UPSTREAM = 'https://www.einvoice.nat.gov.tw/portal/ods/api/v1/DonateCodeList';

export async function handler(event) {
  try {
    // 轉傳查詢參數（預設 limit=10000）
    const qs = event.rawQuery ? `?${event.rawQuery}` : '?limit=10000';
    const url = `${UPSTREAM}${qs}`;

    // Node 18+ 環境有內建 fetch（Netlify 預設可用）
    const resp = await fetch(url, {
      headers: {
        // 有些資料入口會因 Accept 決定回傳型態；保險起見加上
        'accept': 'application/json, text/plain;q=0.9'
      }
    });

    const text = await resp.text(); // 有些單位會回 text/html；先用 text，再嘗試 JSON
    let body = text;
    try {
      body = JSON.stringify(JSON.parse(text)); // 若可 parse，輸出乾淨的 JSON 字串
    } catch (_) {
      // 不是 JSON 就照原樣回（極少數情況）
    }

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'access-control-allow-origin': '*',              // 關鍵：讓你的前端可讀取
        'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800'
      },
      body
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ error: String(err?.message || err) })
    };
  }
}

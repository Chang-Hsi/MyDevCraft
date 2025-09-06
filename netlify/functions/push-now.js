// netlify/functions/push-now.js
const { getAdmin } = require('./_admin')

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders() }
  }

  try {
    const admin = getAdmin()
    const body = JSON.parse(event.body || '{}')
    const tokens = Array.isArray(body.tokens) ? body.tokens : []
    const title = body.title || ''
    const text = body.body || ''
    const link = body.link || '/'

    if (!tokens.length) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ ok: false, error: 'tokens 不可為空' }) }
    }
    if (!title || !text) {
      return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ ok: false, error: '標題/內容不可為空' }) }
    }

    const message = {
      tokens,
      notification: { title, body: text },
      webpush: { fcmOptions: { link } },
      data: { click_action: link },
    }

    const result = await admin.messaging().sendEachForMulticast(message)
    return {
      statusCode: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, result }),
    }
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ ok: false, error: String(err) }) }
  }
}

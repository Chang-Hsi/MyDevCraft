// netlify/functions/schedule-create.js
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
    const db = admin.firestore()
    const body = JSON.parse(event.body || '{}')
    const tokens = Array.isArray(body.tokens) ? body.tokens : []
    const title = body.title || ''
    const text = body.body || ''
    const link = body.link || '/'
    const sendAt = Number(body.sendAt || 0) // 毫秒

    if (!tokens.length) return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ ok: false, error: 'tokens 不可為空' }) }
    if (!title || !text) return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ ok: false, error: '標題/內容不可為空' }) }
    if (!sendAt || isNaN(sendAt)) return { statusCode: 400, headers: corsHeaders(), body: JSON.stringify({ ok: false, error: 'sendAt 無效' }) }

    const doc = {
      tokens,
      title,
      body: text,
      link,
      sendAt,                       // 毫秒
      status: 'pending',            // pending -> processing -> sent / error
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }
    const ref = await db.collection('pushJobs').add(doc)
    return {
      statusCode: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, id: ref.id }),
    }
  } catch (err) {
    return { statusCode: 500, headers: corsHeaders(), body: JSON.stringify({ ok: false, error: String(err) }) }
  }
}

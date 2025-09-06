// netlify/functions/health.cjs
const { getAdmin } = require('./_admin.cjs')

exports.handler = async () => {
  try {
    const hasEnv = !!process.env.FIREBASE_SERVICE_ACCOUNT
    let parsedOk = false
    let projectId = null
    if (hasEnv) {
      try {
        const j = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        parsedOk = true
        projectId = j.project_id || null
      } catch {}
    }
    let adminOk = false
    try { adminOk = !!getAdmin().apps.length } catch {}

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true, hasEnv, parsedOk, adminOk, projectId }),
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: String(e) }) }
  }
}

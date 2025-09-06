// netlify/functions/cron-dispatch.js
// 由 netlify.toml 的 [[scheduled.functions]] 觸發
const { getAdmin } = require('./_admin')

exports.handler = async () => {
  const admin = getAdmin()
  const db = admin.firestore()
  const now = Date.now()

  // 一次處理最多 20 筆
  const snap = await db
    .collection('pushJobs')
    .where('status', '==', 'pending')
    .where('sendAt', '<=', now)
    .limit(20)
    .get()

  if (snap.empty) {
    return { statusCode: 200, body: JSON.stringify({ ok: true, picked: 0 }) }
  }

  let sent = 0
  let errors = 0

  for (const doc of snap.docs) {
    const data = doc.data()
    try {
      await doc.ref.update({ status: 'processing', processingAt: admin.firestore.FieldValue.serverTimestamp() })

      const msg = {
        tokens: data.tokens,
        notification: { title: data.title, body: data.body },
        webpush: { fcmOptions: { link: data.link || '/' } },
        data: { click_action: data.link || '/' },
      }

      const result = await admin.messaging().sendEachForMulticast(msg)
      await doc.ref.update({
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        resultSummary: { successCount: result.successCount, failureCount: result.failureCount },
      })
      sent++
    } catch (e) {
      await doc.ref.update({
        status: 'error',
        error: String(e),
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
      errors++
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true, picked: snap.size, sent, errors }) }
}

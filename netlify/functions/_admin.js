// netlify/functions/_admin.js
// 共用初始化 firebase-admin（只初始化一次）
const admin = require('firebase-admin')

function getAdmin() {
  if (admin.apps.length) return admin
  const json = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!json) throw new Error('缺少環境變數 FIREBASE_SERVICE_ACCOUNT')
  const creds = JSON.parse(json)

  admin.initializeApp({
    credential: admin.credential.cert(creds),
    projectId: creds.project_id,
  })
  return admin
}

module.exports = { getAdmin }

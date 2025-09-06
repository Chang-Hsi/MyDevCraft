// src/lib/firebase.js
import { initializeApp, getApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
// === 新增：FCM 相關 ===
import { getMessaging, isSupported, getToken } from 'firebase/messaging' // 新增

const firebaseConfig = {
  apiKey: 'AIzaSyDskM4TIBAVHGZsr1JRZc0hLxtZcSGcGtw',
  authDomain: 'mydevcraft-5c9a4.firebaseapp.com',
  projectId: 'mydevcraft-5c9a4',
  appId: '1:146120191004:web:f89428bc563bc3dd6943d9',
  messagingSenderId: '146120191004',
}

// 只會在第一次呼叫時初始化，之後重用現有 app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app)

// === 新增：FCM 工具 ===
/**
 * 檢查支援 + 註冊 SW + 申請通知權限 + 取得 Token
 * 回傳：{ supported, permission, token, registration }
 */
export async function initWebPushAndGetToken() {
  const supported = await isSupported().catch(() => false)
  if (!supported) return { supported: false, permission: Notification?.permission }

  // 註冊 SW（必須指向 public 下的檔案路徑）
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

  // 申請通知權限
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { supported: true, permission, token: null, registration }

  // 取得 Token（需 VAPID 公鑰）
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  const messaging = getMessaging(app)
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  }).catch(() => null)

  return { supported: true, permission, token, registration }
}

// public/firebase-messaging-sw.js
// ========== 強制立即控制頁面，避免卡舊版 ==========
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// ========== 載入 Firebase compat 版本（SW 要用 compat） ==========
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js')

// ========== 這組要與前端一致，並且在 SW 內要含 messagingSenderId ==========
firebase.initializeApp({
  apiKey: 'AIzaSyDskM4TIBAVHGZsr1JRZc0hLxtZcSGcGtw',
  authDomain: 'mydevcraft-5c9a4.firebaseapp.com',
  projectId: 'mydevcraft-5c9a4',
  appId: '1:146120191004:web:f89428bc563bc3dd6943d9',
  // ★ SW 內一定要有這個
  messagingSenderId: '146120191004',
})

const messaging = firebase.messaging()

// 背景訊息：顯示系統通知
messaging.onBackgroundMessage((payload) => {
  const n = payload.notification || {}
  const d = payload.data || {}
  const title = n.title || d.title || '通知'
  const body = n.body || d.body || ''
  const icon = n.icon || d.icon || '/favicon.ico'
  const clickUrl = n.click_action || d.click_action || '/'

  self.registration.showNotification(title, {
    body,
    icon,
    data: { url: clickUrl, ...d },
  })
})

// 點通知開頁/聚焦
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((arr) => {
      for (const c of arr) if ('focus' in c) return c.focus()
      return clients.openWindow ? clients.openWindow(url) : null
    })
  )
})

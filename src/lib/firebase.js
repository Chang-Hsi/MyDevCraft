// src/lib/firebase.js
import { initializeApp, getApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDskM4TIBAVHGZsr1JRZc0hLxtZcSGcGtw',
  authDomain: 'mydevcraft-5c9a4.firebaseapp.com',
  projectId: 'mydevcraft-5c9a4',
  appId: '1:146120191004:web:f89428bc563bc3dd6943d9',
}

// 只會在第一次呼叫時初始化，之後重用現有 app
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app)

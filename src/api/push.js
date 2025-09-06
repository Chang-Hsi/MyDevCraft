// src/api/push.js
import axios from 'axios'

// 部署後建議留空：走同網域 /.netlify/functions/*
// 本地用 Netlify CLI 開發：.env.local 設 VITE_PUSH_API=http://localhost:8888
const BASE = import.meta.env.VITE_PUSH_API || ''

export const sendNow = (payload) =>
  axios.post(`${BASE}/.netlify/functions/push-now`, payload).then(r => r.data)

export const scheduleCreate = (payload) =>
  axios.post(`${BASE}/.netlify/functions/schedule-create`, payload).then(r => r.data)

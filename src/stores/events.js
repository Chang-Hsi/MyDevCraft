// src/stores/events.js
import { defineStore } from 'pinia'

const STORAGE_KEY = 'demo.events'

const initialData = [
  {
    id: 1,
    title: '夏季會員見面會',
    creator: 'Angela',
    startAt: '2025-07-12 14:00',
    endAt: '2025-07-12 16:30',
    status: '尚未開始',
    participants: 180,
    desc: '活動介紹文字……',
    content: '活動介紹文字……'
  },
]

// 轉舊資料的 timeRange -> startAt/endAt
function normalize(e) {
  if (!e.startAt && e.timeRange) {
    const [s, t] = e.timeRange.split('~').map((x) => x.trim())
    return { ...e, startAt: s, endAt: t }
  }
  return e
}

function loadFromLS() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const arr = raw ? JSON.parse(raw) : initialData
    return arr.map(normalize)
  } catch {
    return initialData.map(normalize)
  }
}
function saveToLS(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
}

export const useEventsStore = defineStore('events', {
  state: () => ({ list: loadFromLS() }),
  getters: {
    byId: (s) => (id) => s.list.find((e) => e.id === Number(id)),
    nextId: (s) => s.list.reduce((m, e) => Math.max(m, e.id), 0) + 1,
  },
  actions: {
    add(payload) {
      this.list.push({ ...payload, id: this.nextId })
      saveToLS(this.list)
    },
    update(id, payload) {
      const i = this.list.findIndex((e) => e.id === Number(id))
      if (i > -1) {
        this.list[i] = { ...this.list[i], ...payload }
        saveToLS(this.list)
      }
    },
    remove(id) {
      this.list = this.list.filter((e) => e.id !== Number(id))
      saveToLS(this.list)
    },
    // ✅ 批次刪除
    removeMany(ids) {
      const set = new Set(ids.map(Number))
      this.list = this.list.filter((e) => !set.has(e.id))
      saveToLS(this.list)
    },
  },
})
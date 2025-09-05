// src/api/weather.js
import request from '@/utils/request'

const CWA_BASE = 'https://opendata.cwa.gov.tw/api/v1'
const DATASET   = 'F-C0032-001' // 縣市36小時預報
const CACHE_KEY = 'cwa:taoyuan36h'
const TTL_MS    = 30 * 60 * 1000 // 30 分鐘

export async function getWeatherInfo() {
  // 1) 讀快取
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      const { ts, payload } = JSON.parse(cached)
      if (Date.now() - ts < TTL_MS) return payload
    }
  } catch (_) {}

  // 2) 打 CWA
  const data = await request({
    baseURL: CWA_BASE,
    url: `/rest/datastore/${DATASET}`,
    method: 'get',
    params: {
      Authorization: import.meta.env.VITE_CWA_KEY,
      locationName: '桃園市',
    },
  })

  // 3) 解析
  const loc = data?.records?.location?.[0]
  if (!loc) return null

  const pick = (name) =>
    loc.weatherElement.find(e => e.elementName === name)?.time?.[0]?.parameter?.parameterName

  const payload = {
    wx:   pick('Wx')   || '',   // 天氣現象（多雲、晴…）
    minT: pick('MinT') || '',   // 最低溫
    maxT: pick('MaxT') || '',   // 最高溫
  }

  // 4) 寫快取
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), payload }))
  } catch (_) {}

  return payload
}

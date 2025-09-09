// src/stores/seo.js
// SEO 全域狀態（Pinia）— 可展示版：預覽與健康檢查會即時計算

import { defineStore } from 'pinia'
import { reactive, ref, computed } from 'vue'

export const useSeoStore = defineStore('seo', () => {
  // ---------- 站點 / 預設 ----------
  const site = reactive({
    name: 'MyDevCraft',
    locale: 'zh-TW',
    domain: 'example.com'
  })

  const defaults = reactive({
    titleTemplate: '{title}｜{siteName}',
    descTemplate: '{excerpt}',
    canonicalMode: 'auto', // auto | custom
    robotsIndex: true,
    robotsFollow: true
  })

  const og = reactive({
    inherit: true, // true = 沿用模板結果
    image: '',     // 預設分享圖（留空則用 fallback）
    title: '',
    desc: ''
  })

  const contentTemplates = reactive({
    post:    { enabled: true,  title: '{title}｜{siteName}',    desc: '{excerpt}', imageMode: 'first',   fixedImage: '', noindexOnPaged: true  },
    product: { enabled: true,  title: '{title}｜{siteName}',    desc: '{excerpt}', imageMode: 'first',   fixedImage: '', noindexOnPaged: true  },
    category:{ enabled: false, title: '{category}｜{siteName}', desc: '{excerpt}', imageMode: 'default', fixedImage: '', noindexOnPaged: true  },
    page:    { enabled: true,  title: '{title}｜{siteName}',    desc: '{excerpt}', imageMode: 'default', fixedImage: '', noindexOnPaged: false }
  })

  const typeDefs = [
    { key: 'post',    label: '文章',   desc: 'Blog / News' },
    { key: 'product', label: '產品',   desc: '商城 / 服務' },
    { key: 'category',label: '分類頁', desc: '列表 / 聚合' },
    { key: 'page',    label: '一般頁', desc: '靜態 / 介紹' }
  ]

  const sitemap = reactive({
    enabled: true,
    pingEnabled: true,
    lastBuiltAt: new Date()
  })

  const robots = reactive({
    extra: ''
  })

  // ---------- 可插入的模板變數 ----------
  const tokens = ['{title}', '{siteName}', '{category}', '{excerpt}', '{page}', '{date}']
  const descCount = computed(() => (defaults.descTemplate || '').length)

  // ---------- 示例內容（用於預覽與健康檢查） ----------
  /**
   * ContentItem:
   * { id, type: 'post'|'product'|'page'|'category', title, excerpt, category, slug, page, date, images:[] }
   */
  const contents = ref([])

  function seedDemoContents() {
    // 若已存在就不重複注入
    if (contents.value.length) return
    contents.value = [
      {
        id: 1, type: 'post', title: '公司簡介', excerpt: '我們是一間專注前端工程與 SEO 的團隊。',
        category: '部落格', slug: 'about', page: 1, date: '2025-09-01',
        images: ['https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1200&auto=format']
      },
      {
        id: 2, type: 'post', title: '公司簡介', excerpt: '這篇是重複標題的示例，用於健康檢查。',
        category: '部落格', slug: 'about-2', page: 1, date: '2025-09-02', images: []
      },
      {
        id: 3, type: 'product', title: '智慧掃描槍', excerpt: '',
        category: '設備', slug: 'scanner', page: 1, date: '2025-08-21',
        images: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format']
      },
      {
        id: 4, type: 'product', title: 'RIV 專業洗衣', excerpt: '',
        category: '服務', slug: 'riv', page: 1, date: '2025-08-22', images: []
      },
      {
        id: 5, type: 'page', title: '隱私權政策', excerpt: '',
        category: '', slug: 'privacy', page: 1, date: '2025-07-10', images: []
      },
      {
        id: 6, type: 'post', title: 'Demo 文章標題：用後台自動化你的 SEO',
        excerpt: '這是一段示例摘要，用來展示描述模板如何產生 SERP 摘要與社群分享描述，建議控制在 80–120 字之間以獲得較好的顯示效果。',
        category: '部落格', slug: 'demo', page: 1, date: '2025-08-30',
        images: ['https://images.unsplash.com/photo-1517059224940-d4af9eec41e5?q=80&w=1200&auto=format']
      },
      {
        id: 7, type: 'post', title: '分頁列表示例', excerpt: '這是列表第 2 頁內容，將被標記為 noindex（示例）。',
        category: '部落格', slug: 'list', page: 2, date: '2025-08-25', images: []
      }
    ]
  }

  // ---------- 工具：渲染模板（帶 item） ----------
  function formatTime(val) {
    if (!val) return '—'
    const d = val instanceof Date ? val : new Date(val)
    if (isNaN(d.getTime())) return '—'
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  function renderWith(item, tpl = '') {
    const safe = (v) => (v == null ? '' : String(v))
    return (tpl || '')
      .replaceAll('{title}', safe(item.title))
      .replaceAll('{siteName}', safe(site.name))
      .replaceAll('{category}', safe(item.category))
      .replaceAll('{excerpt}', safe(item.excerpt))
      .replaceAll('{page}', safe(item.page || 1))
      .replaceAll('{date}', safe(item.date || ''))
  }

  function contentUrl(item) {
    const base = `https://${site.domain}`
    const path = `/${item.type}/${item.slug}`
    return item.page && item.page > 1 ? `${base}${path}/page/${item.page}` : `${base}${path}`
  }

  // 依 item + 當前設定，計算「此頁最終會呈現的 SEO 值」
  function renderForItem(item) {
    const typeCfg = contentTemplates[item.type] || {}
    const titleTpl = typeCfg.enabled ? (typeCfg.title || defaults.titleTemplate) : defaults.titleTemplate
    const descTpl  = typeCfg.enabled ? (typeCfg.desc  || defaults.descTemplate)  : defaults.descTemplate

    const title = renderWith(item, titleTpl)
    const desc  = renderWith(item, descTpl)

    // OG 文案：沿用模板 or 自訂
    const ogTitle = og.inherit ? title : (og.title || title)
    const ogDesc  = og.inherit ? desc  : (og.desc  || desc)

    // OG 圖片：依型別規則決定
    let ogImage = ''
    if (typeCfg.enabled) {
      if (typeCfg.imageMode === 'fixed' && typeCfg.fixedImage) ogImage = typeCfg.fixedImage
      else if (typeCfg.imageMode === 'first' && item.images && item.images.length) ogImage = item.images[0]
    }
    if (!ogImage) ogImage = og.image || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format'

    // Robots（簡化規則）
    let robotsIndex = !!defaults.robotsIndex
    if (typeCfg.noindexOnPaged && item.page && item.page > 1) robotsIndex = false
    const robotsFollow = !!defaults.robotsFollow

    return {
      title,
      desc,
      ogTitle,
      ogDesc,
      ogImage,
      url: contentUrl(item),
      robots: { index: robotsIndex, follow: robotsFollow }
    }
  }

  // ---------- 預覽：給預覽分頁使用 ----------
  const previewType = ref('post')
  const previewId = ref(null)

  const itemsByType = computed(() => (t) => contents.value.filter(i => i.type === t))
  const previewItems = computed(() => {
    const list = Array.isArray(contents.value) ? contents.value : []
    return list.filter(i => i.type === previewType.value)
  })
  const activePreviewItem = computed(() => {
    const list = previewItems.value
    if (!list.length) return null
    const found = list.find(i => i.id === previewId.value)
    return found || list[0]
  })
  const activePreviewData = computed(() => activePreviewItem.value ? renderForItem(activePreviewItem.value) : null)

  // ---------- 健康檢查（示意規則，真實即時計算） ----------
  const healthStats = computed(() => {
    const items = contents.value
    if (!items.length) return { dupTitle: 0, missDesc: 0, noindex: 0 }

    // 計算每頁最終的 title/desc/robots
    const rendered = items.map(it => ({ it, r: renderForItem(it) }))

    // 重複 Title
    const titleMap = new Map()
    rendered.forEach(({ r }) => {
      const key = r.title.trim()
      if (!key) return
      titleMap.set(key, (titleMap.get(key) || 0) + 1)
    })
    const dupTitleSet = new Set([...titleMap.entries()].filter(([_, c]) => c > 1).map(([t]) => t))
    const dupTitle = rendered.filter(({ r }) => dupTitleSet.has(r.title.trim())).length

    // 缺少描述（最終結果為空）
    const missDesc = rendered.filter(({ r }) => !r.desc || !r.desc.trim()).length

    // noindex 頁
    const noindex = rendered.filter(({ r }) => !r.robots.index).length

    return { dupTitle, missDesc, noindex }
  })

  function healthList(kind) {
    const items = contents.value
    const rendered = items.map(it => ({ it, r: renderForItem(it) }))
    if (kind === 'dupTitle') {
      const map = new Map()
      rendered.forEach(({ r, it }) => {
        const k = r.title.trim()
        if (!k) return
        const arr = map.get(k) || []
        arr.push({ id: it.id, type: it.type, title: r.title, url: contentUrl(it) })
        map.set(k, arr)
      })
      return [...map.values()].filter(arr => arr.length > 1).flat()
    }
    if (kind === 'missDesc') {
      return rendered
        .filter(({ r }) => !r.desc || !r.desc.trim())
        .map(({ it, r }) => ({ id: it.id, type: it.type, title: r.title, url: contentUrl(it) }))
    }
    if (kind === 'noindex') {
      return rendered
        .filter(({ r }) => !r.robots.index)
        .map(({ it, r }) => ({ id: it.id, type: it.type, title: r.title, url: contentUrl(it) }))
    }
    return []
  }

  // ---------- 動作 ----------
  function applyStep1Recommended({ force = true } = {}) {
    // 註解：force=true 代表無論原本有沒有值都覆寫
    if (force || !site.name)   site.name   = 'MyDevCraft'
    if (force || !site.locale) site.locale = 'zh-TW'
    if (force || !site.domain) site.domain = 'example.com'
  }
  // 一鍵套用建議：Step 2（標題／描述模板）
  function applyStep2Recommended({ force = true } = {}) {
    if (force || !defaults.titleTemplate) defaults.titleTemplate = '{title}｜{siteName}'
    if (force || !defaults.descTemplate)  defaults.descTemplate  = '{excerpt}'
  }
  // 一鍵套用建議：Sitemap / Robots
  function applySitemapRobotsRecommended({ force = true } = {}) {
    if (force || typeof defaults.robotsIndex  !== 'boolean') defaults.robotsIndex  = true
    if (force || typeof defaults.robotsFollow !== 'boolean') defaults.robotsFollow = true
    if (force || typeof sitemap.enabled       !== 'boolean') sitemap.enabled       = true
    if (force || typeof sitemap.pingEnabled   !== 'boolean') sitemap.pingEnabled   = true
  }

  // 一鍵套用建議：OG/Twitter（沿用模板）
  function applyOGRecommended({ force = true } = {}) {
    if (force || typeof og.inherit !== 'boolean') og.inherit = true
    if (force) {
      og.title = ''
      og.desc  = ''
      og.image = ''
    }
  }
  function saveAll() {/* 示意：此處可串 API */}
  function resetAll() {
    site.name = 'MyDevCraft'
    site.locale = 'zh-TW'
    site.domain = 'example.com'
    defaults.titleTemplate = '{title}｜{siteName}'
    defaults.descTemplate = '{excerpt}'
    defaults.canonicalMode = 'auto'
    defaults.robotsIndex = true
    defaults.robotsFollow = true
    og.inherit = true
    og.image = ''
    og.title = ''
    og.desc = ''
    Object.assign(contentTemplates.post,    { enabled: true,  title: '{title}｜{siteName}',    desc: '{excerpt}', imageMode: 'first',   fixedImage: '', noindexOnPaged: true  })
    Object.assign(contentTemplates.product, { enabled: true,  title: '{title}｜{siteName}',    desc: '{excerpt}', imageMode: 'first',   fixedImage: '', noindexOnPaged: true  })
    Object.assign(contentTemplates.category,{ enabled: false, title: '{category}｜{siteName}', desc: '{excerpt}', imageMode: 'default', fixedImage: '', noindexOnPaged: true  })
    Object.assign(contentTemplates.page,    { enabled: true,  title: '{title}｜{siteName}',    desc: '{excerpt}', imageMode: 'default', fixedImage: '', noindexOnPaged: false })
    sitemap.enabled = true
    sitemap.pingEnabled = true
    sitemap.lastBuiltAt = new Date()
    robots.extra = ''
    contents.value = []
  }
  function buildSitemapNow() { sitemap.lastBuiltAt = new Date() }

  // ---------- 對外 ----------
  return {
    // 狀態
    site, defaults, og, contentTemplates, typeDefs, sitemap, robots,
    tokens, descCount,

    // 內容與預覽
    contents, seedDemoContents,
    previewType, previewId, itemsByType, previewItems, activePreviewItem, activePreviewData,

    // 渲染與連結
    renderWith, renderForItem, contentUrl,

    // 健康檢查
    healthStats, healthList,

    // 動作
    applyStep1Recommended, applyStep2Recommended, applySitemapRobotsRecommended, applySitemapRobotsRecommended, saveAll, resetAll, buildSitemapNow,

    formatTime 
  }
})

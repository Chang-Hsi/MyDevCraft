import { defineStore } from 'pinia'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const usePermStore = defineStore('perm', {
  state: () => ({
    ready: false,
    rules: {},
    roleId: 'default',
  }),
  getters: {
    // 如果沒設定就當作可通過
    can: (state) => (path) => state.rules[path] !== false,
  },
  actions: {
    async load(roleId) {
      if (roleId) this.roleId = roleId
      try {
        const snap = await getDoc(doc(db, 'permissions', this.roleId))
        if (snap.exists()) {
          const data = snap.data()
          this.rules = data?.rules || {}
        } else {
          this.rules = {}
        }
      } catch (e) {
        // Firestore 失敗 → 試試 localStorage
        try {
          const raw = localStorage.getItem('perm.rules.' + this.roleId)
          this.rules = raw ? JSON.parse(raw) : {}
        } catch {
          this.rules = {}
        }
      } finally {
        this.ready = true
      }
    },
    async save(rules) {
      // 先寫 localStorage（當快取／備援）
      try {
        localStorage.setItem('perm.rules.' + this.roleId, JSON.stringify(rules || this.rules))
      } catch {}

      // 再寫 Firestore（可失敗，不影響當前使用）
      try {
        await setDoc(
          doc(db, 'permissions', this.roleId),
          { rules: rules || this.rules },
          { merge: true }
        )
      } catch (e) {
        // 可視需求提示使用者；這裡先靜默
      }

      if (rules) this.rules = rules
    },

    // 把「權限設定頁」的 menuItems 轉成路由可用的規則（true/false）
    setFromMenuItems(menuItems) {
      // 這張 map：把「群組/子頁名」對應到實際路徑
      const map = {
        '首頁/分析頁': '/dashboard/analysis',
        '首頁/工作台': '/dashboard/workbench',
        '文檔/文檔': '/docs',
        '引導/引導': '/guide',
        '組件/表單': '/components/form',
        '組件/表格': '/components/table',
        '組件/上傳': '/components/upload',
        '功能/編輯器': '/features/editor',
        '功能/推播': '/features/push',
        '功能/SEO': '/features/seo',
        'hooks/useRequest': '/hooks/useRequest',
        'hooks/useForm': '/hooks/useForm',
        '多級菜單/三級 - 1-1': '/multi/1-1',
        '多級菜單/三級 - 1-2': '/multi/1-2',
        '多級菜單/二級 - 2': '/multi/2',
        '綜合示例/付款': '/examples/payment',
        '綜合示例/編輯': '/examples/edit',
        '錯誤頁面/400 錯誤': '/errors/400',
        '錯誤頁面/403 禁止訪問': '/errors/403',
        '錯誤頁面/500 伺服器錯誤': '/errors/500',
        '權限管理/頁面權限': '/permission/page',
      }

      const rules = {}
      menuItems.forEach((group) => {
        group.subItems.forEach((si) => {
          const key = `${group.name}/${si.name}`
          if (map[key]) {
            rules[map[key]] = si.enabled === 1
          }
        })
      })

      this.rules = rules
      return rules
    },
  },
})

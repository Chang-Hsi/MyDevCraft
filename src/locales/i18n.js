// src/locales/i18n.js
import { createI18n } from 'vue-i18n'

// 讀取上次選擇
const saved = localStorage.getItem('lang') || 'zh-TW'

// ===== 字典 =====
const messages = {
  'zh-TW': {
    menu: {
      home: '首頁',
      analysis: '分析頁',
      workbench: '工作台',
      docs: '文檔',
      guide: '引導',
      components: '組件',
      form: '表單',
      table: '表格',
      upload: '上傳',
      features: '功能',
      editor: '編輯器',
      push: '推播',
      seo: 'SEO',
      hooks: 'hooks',
      useRequest: 'useRequest',
      useForm: 'useForm',
      multi: '多級菜單',
      multi11: '三級 - 1-1',
      multi12: '三級 - 1-2',
      multi2: '二級 - 2',
      examples: '綜合示例',
      payment: '付款',
      events: '活動',
      eventNew: '新增活動',
      eventEdit: '編輯活動',
      errors: '錯誤頁面',
      permission: '權限管理',
      pagePermission: '頁面權限',
      buttonPermission: '按鈕權限',
      errors400: '400 錯誤',
      errors403: '403 禁止訪問',
      errors500: '500 伺服器錯誤',
    },
    header: {
      language: '語言',
      fullscreen: '全螢幕',
      profile: '個人中心',
      logout: '退出登錄',
    },
    pages: {
      analysis: {
        title: '分析頁',
        kpis: {
          newUsers: '新增用戶',
          unreadMessages: '未讀消息',
          revenue: '成交金額',
          orders: '購物總量',
        },
        charts: {
          sourceTitle: '用戶訪問來源',
          weeklyActiveTitle: '每周用戶活躍量',
          monthlySalesTitle: '每月銷售額',
        },
        sources: {
          direct: '直接訪問',
          email: '郵件營銷',
          affiliate: '聯盟廣告',
          video: '視頻廣告',
          search: '搜索引擎',
        },
        week: {
          mon: '週一', tue: '週二', wed: '週三', thu: '週四', fri: '週五', sat: '週六', sun: '週日'
        },
        months: {
          jan: '一月', feb: '二月', mar: '三月', apr: '四月', may: '五月', jun: '六月',
          jul: '七月', aug: '八月', sep: '九月', oct: '十月', nov: '十一月', dec: '十二月'
        },
        series: {
          plan: '預計',
          actual: '實際'
        }
      },
      workbench: {
        greet: { morning: '早安', noon: '午安', evening: '晚安' },
        weather: {
          sample: '今天晴，20℃ – 32℃！',
          format: '今天{wx}，{min}℃ – {max}℃！',
        },
        stats: { projects: '項目數', todo: '待辦', doing: '進行中', done: '已完成' },
        lists: { todo: 'ToDo', doing: 'Doing', done: 'Done', remark: 'Remark', template: 'Template' },
        actions: {
          addAnother: '新增卡片',
          menu: {
            add: '新增卡片', rename: '重新命名清單', sortCreated: '排序：建立時間',
            sortDue: '排序：到期日', export: '匯出本清單 JSON', import: '從 JSON 匯入至本清單',
            clear: '清空本清單', copyModeOn: '複製到', copyModeOff: '移動到'
          }
        },
        dialog: {
          createTitle: '新增卡片', editTitle: '編輯卡片',
          fields: {
            title: '標題', labels: '標籤', note: '備註', dueDate: '到期日',
            checklist: 'Checklist', assigneeAvatar: '負責人頭像', list: '清單'
          },
          btn: { save: '儲存', cancel: '取消' }
          }
      },
      docs: { title: '文檔' },
      guide: {
        title: '引導頁',
        hint: '引導對第一次進來的使用者很有幫助，點「開始」即可逐步介紹側欄與上方工具列的功能（基於 driver.js）。',
        start: '開始',
        progress: '顯示進度',
        driver: { next: '下一步', prev: '上一步', done: '完成' },
        steps: {
          sidebar: {
            title: '側邊欄',
            desc: '主要功能導航，會依登入角色動態顯示可見選單與路由權限。'
          },
          breadcrumb: {
            title: '麵包屑',
            desc: '顯示目前所在路由階層，支援快速返回上層。'
          },
          lang: {
            title: '語言切換',
            desc: '切換 zh-TW / zh-CN / en-US，並記錄在 localStorage。'
          },
          fullscreen: {
            title: '全螢幕',
            desc: '切換瀏覽器全螢幕，適合專注檢視報表或看板。'
          },
          user: {
            title: '使用者選單',
            desc: '進入個人中心、修改密碼或安全登出。'
          }
        }
      },
      error: {
        msg400: '抱歉，您訪問的頁面不存在。',
        msg403: '抱歉，您無權訪問此頁面。',
        msg500: '抱歉，伺服器發生錯誤。'
      }
    },
  },
  'zh-CN': {
    menu: {
      home: '首页',
      analysis: '分析页',
      workbench: '工作台',
      docs: '文档',
      guide: '引导',
      components: '组件',
      form: '表单',
      table: '表格',
      upload: '上传',
      features: '功能',
      editor: '编辑器',
      push: '推送',
      seo: 'SEO',
      hooks: 'hooks',
      useRequest: 'useRequest',
      useForm: 'useForm',
      multi: '多级菜单',
      multi11: '三级 - 1-1',
      multi12: '三级 - 1-2',
      multi2: '二级 - 2',
      examples: '综合示例',
      payment: '付款',
      events: '活动',
      eventNew: '新增活动',
      eventEdit: '编辑活动',
      errors: '错误页面',
      permission: '权限管理',
      pagePermission: '页面权限',
      buttonPermission: '按钮权限',
      errors400: '400 错误',
      errors403: '403 禁止访问',
      errors500: '500 服务器错误',
    },
    header: {
      language: '语言',
      fullscreen: '全屏',
      profile: '个人中心',
      logout: '退出登录',
    },
    pages: {
      analysis: {
        title: '分析页',
        kpis: {
          newUsers: '新增用户',
          unreadMessages: '未读消息',
          revenue: '成交金额',
          orders: '购物总量',
        },
        charts: {
          sourceTitle: '用户访问来源',
          weeklyActiveTitle: '每周用户活跃量',
          monthlySalesTitle: '每月销售额',
        },
        sources: {
          direct: '直接访问',
          email: '邮件营销',
          affiliate: '联盟广告',
          video: '视频广告',
          search: '搜索引擎',
        },
        week: {
          mon: '周一', tue: '周二', wed: '周三', thu: '周四', fri: '周五', sat: '周六', sun: '周日'
        },
        months: {
          jan: '一月', feb: '二月', mar: '三月', apr: '四月', may: '五月', jun: '六月',
          jul: '七月', aug: '八月', sep: '九月', oct: '十月', nov: '十二月', dec: '十二月'
        },
        series: { plan: '预计', actual: '实际' }
      },
      workbench: {
        greet: { morning: '早安', noon: '午安', evening: '晚安' },
        weather: { sample: '今天晴，20℃ – 32℃！', format: '今天{wx}，{min}℃ – {max}℃！' },
        stats: { projects: '项目数', todo: '待办', doing: '进行中', done: '已完成' },
        lists: { todo: 'ToDo', doing: 'Doing', done: 'Done', remark: 'Remark', template: 'Template' },
        actions: {
          addAnother: '新增卡片',
          menu: {
            add: '新增卡片', rename: '重命名清单', sortCreated: '排序：创建时间',
            sortDue: '排序：到期日', export: '导出本清单 JSON', import: '从 JSON 导入至本清单',
            clear: '清空本清单', copyModeOn: '复制到', copyModeOff: '移动到'
          }
        },
        dialog: {
          createTitle: '新增卡片', editTitle: '编辑卡片',
          fields: {
            title: '标题', labels: '标签', note: '备注', dueDate: '到期日',
            checklist: 'Checklist', assigneeAvatar: '负责人头像', list: '清单'
          },
          btn: { save: '保存', cancel: '取消' }
        }
      },
      docs: { title: '文档' },
      guide: {
        title: '引导页',
        hint: '引导对第一次进入的用户很有帮助，点击「开始」将逐步介绍侧栏和顶部工具栏功能（基于 driver.js）。',
        start: '开始',
        progress: '显示进度',
        driver: { next: '下一步', prev: '上一步', done: '完成' },
        steps: {
          sidebar: {
            title: '侧边栏',
            desc: '主要功能导航，会根据登录角色动态显示可见菜单与路由权限。'
          },
          breadcrumb: {
            title: '面包屑',
            desc: '显示当前所在路由层级，支持快速返回上层。'
          },
          lang: {
            title: '语言切换',
            desc: '切换 zh-TW / zh-CN / en-US，并记录到 localStorage。'
          },
          fullscreen: {
            title: '全屏',
            desc: '切换浏览器全屏，适合专注查看报表或看板。'
          },
          user: {
            title: '用户菜单',
            desc: '进入个人中心、修改密码或安全登出。'
          }
        }
      },
      error: {
        msg400: '抱歉，您访问的页面不存在。',
        msg403: '抱歉，您无权访问此页面。',
        msg500: '抱歉，服务器发生错误。'
      }
    },
  },
  'en-US': {
    menu: {
      home: 'Home',
      analysis: 'Analysis',
      workbench: 'Workbench',
      docs: 'Docs',
      guide: 'Guide',
      components: 'Components',
      form: 'Form',
      table: 'Table',
      upload: 'Upload',
      features: 'Features',
      editor: 'Editor',
      push: 'Push',
      seo: 'SEO',
      hooks: 'hooks',
      useRequest: 'useRequest',
      useForm: 'useForm',
      multi: 'Nested Menus',
      multi11: 'Level 3 - 1-1',
      multi12: 'Level 3 - 1-2',
      multi2: 'Level 2',
      examples: 'Examples',
      payment: 'Payment',
      events: 'Events',
      eventNew: 'New Event',
      eventEdit: 'Edit Event',
      errors: 'Error Pages',
      permission: 'Permission',
      pagePermission: 'Page Permission',
      buttonPermission: 'Button Permission',
      errors400: '400 Error',
      errors403: '403 Forbidden',
      errors500: '500 Server Error',
    },
    header: {
      language: 'Language',
      fullscreen: 'Fullscreen',
      profile: 'Profile',
      logout: 'Logout',
    },
    pages: {
      analysis: {
        title: 'Analysis',
        kpis: {
          newUsers: 'New Users',
          unreadMessages: 'Unread Messages',
          revenue: 'Revenue',
          orders: 'Total Orders',
        },
        charts: {
          sourceTitle: 'User Traffic Sources',
          weeklyActiveTitle: 'Weekly Active Users',
          monthlySalesTitle: 'Monthly Sales',
        },
        sources: {
          direct: 'Direct',
          email: 'Email Marketing',
          affiliate: 'Affiliate Ads',
          video: 'Video Ads',
          search: 'Search Engines',
        },
        week: {
          mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun'
        },
        months: {
          jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr', may: 'May', jun: 'Jun',
          jul: 'Jul', aug: 'Aug', sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec'
        },
        series: { plan: 'Plan', actual: 'Actual' }
      },
      workbench: {
        greet: { morning: 'Good morning', noon: 'Good afternoon', evening: 'Good evening' },
        weather: { sample: 'Sunny today, 20–32°C!', format: 'Today {wx}, {min}–{max}°C!' },
        stats: { projects: 'Projects', todo: 'To-do', doing: 'Doing', done: 'Done' },
        lists: { todo: 'ToDo', doing: 'Doing', done: 'Done', remark: 'Remark', template: 'Template' },
        actions: {
          addAnother: 'Add another card',
          menu: {
            add: 'Add card', rename: 'Rename list', sortCreated: 'Sort by created time',
            sortDue: 'Sort by due date', export: 'Export list JSON', import: 'Import into list from JSON',
            clear: 'Clear this list', copyModeOn: 'Copy to', copyModeOff: 'Move to'
          }
        },
        dialog: {
          createTitle: 'Create Card', editTitle: 'Edit Card',
          fields: {
            title: 'Title', labels: 'Labels', note: 'Notes', dueDate: 'Due date',
            checklist: 'Checklist', assigneeAvatar: 'Assignee avatar', list: 'List'
          },
          btn: { save: 'Save', cancel: 'Cancel' }
        }
      },
      docs: { title: 'Docs' },
      guide: {
        title: 'Guide',
        hint: 'A guided tour helps first-time users. Click “Start” to walk through the sidebar and top toolbar features (powered by driver.js).',
        start: 'Start',
        progress: 'Show progress',
        driver: { next: 'Next', prev: 'Previous', done: 'Done' },
        steps: {
          sidebar: {
            title: 'Sidebar',
            desc: 'Primary navigation. Menu items and routes are shown based on the signed-in role.'
          },
          breadcrumb: {
            title: 'Breadcrumb',
            desc: 'Shows the current route hierarchy and allows quick navigation back.'
          },
          lang: {
            title: 'Language',
            desc: 'Switch between zh-TW / zh-CN / en-US. The choice is saved in localStorage.'
          },
          fullscreen: {
            title: 'Fullscreen',
            desc: 'Toggle the browser fullscreen; great for dashboards and boards.'
          },
          user: {
            title: 'User Menu',
            desc: 'Open profile, change password, or sign out safely.'
          }
        }
      },
      error: {
        msg400: 'Sorry, the page you requested does not exist.',
        msg403: 'Sorry, you do not have permission to access this page.',
        msg500: 'Sorry, the server encountered an error.'
      }
    },
  },
}

export const i18n = createI18n({
  legacy: false,
  locale: saved,          // 當前語系
  globalInjection: true,
  fallbackLocale: 'en-US',
  messages,
})

// 封裝一個切換方法（同時記錄到 localStorage）
export function setLocale(lang) {
  i18n.global.locale.value = lang
  localStorage.setItem('lang', lang)
}

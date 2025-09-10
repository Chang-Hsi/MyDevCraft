import { createRouter, createWebHistory } from 'vue-router'
import { usePermStore } from '@/stores/perm'
import { i18n } from '@/locales/i18n'

// 路由表
const routes = [
  // 登入區（免登入）
  {
    path: '/login',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { title: '登錄', public: true },
      },
    ],
  },

  // 主框架
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      // 進入根路徑時導到「分析頁」
      {
        path: '',
        redirect: '/dashboard/analysis',
        meta: { public: false },
      },

      // ===== 首頁（子頁）=====
      {
        path: '/dashboard/analysis',
        name: 'DashboardAnalysis',
        component: () => import('@/views/dashboard/Analysis.vue'),
        meta: {
          titleKey: 'menu.analysis',
          breadcrumb: ['menu.home', 'menu.analysis'],
        },
      },
      {
        path: '/dashboard/workbench',
        name: 'DashboardWorkbench',
        component: () => import('@/views/dashboard/Workbench.vue'),
        meta: {
          titleKey: 'menu.workbench',
          breadcrumb: ['menu.home', 'menu.workbench'],
        },
      },

      // ===== 文檔 =====
      {
        path: '/docs',
        name: 'Docs',
        component: () => import('@/views/docs/Docs.vue'),
        meta: {
          titleKey: 'menu.docs',
          breadcrumb: ['menu.docs'],
        },
      },

      // ===== 引導 =====
      {
        path: '/guide',
        name: 'Guide',
        component: () => import('@/views/guide/Guide.vue'),
        meta: {
          titleKey: 'menu.guide',
          breadcrumb: ['menu.guide'],
        },
      },

      // ===== 組件（表單 / 表格 / 上傳）=====
      {
        path: '/components/form',
        name: 'ComponentsForm',
        component: () => import('@/views/components/forms/FormDemo.vue'),
        meta: {
          titleKey: 'menu.form',
          breadcrumb: ['menu.components', 'menu.form'],
        },
      },
      {
        path: '/components/table',
        name: 'ComponentsTable',
        component: () => import('@/views/components/TableDemo.vue'),
        meta: {
          titleKey: 'menu.table',
          breadcrumb: ['menu.components', 'menu.table'],
        },
      },
      {
        path: '/components/upload',
        name: 'ComponentsUpload',
        component: () => import('@/views/components/UploadDemo.vue'),
        meta: {
          titleKey: 'menu.upload',
          breadcrumb: ['menu.components', 'menu.upload'],
        },
      },

      // ===== 功能（編輯器 / 剪貼簿 / 列印）=====
      {
        path: '/features/editor',
        name: 'FeaturesEditor',
        component: () => import('@/views/features/Editor.vue'),
        meta: {
          titleKey: 'menu.editor',
          breadcrumb: ['menu.features', 'menu.editor'],
        },
      },
      {
        path: '/features/push',
        name: 'FeaturesPush',
        component: () => import('@/views/features/Push.vue'),
        meta: {
          titleKey: 'menu.push',
          breadcrumb: ['menu.features', 'menu.push'],
        },
      },
      {
        path: '/features/seo',
        name: 'FeaturesSEO',
        component: () => import('@/views/features/SEO.vue'),
        meta: {
          titleKey: 'menu.seo',
          breadcrumb: ['menu.features', 'menu.seo'],
        },
      },

      // ===== hooks（useRequest / useForm）=====
      {
        path: '/hooks/useRequest',
        name: 'HooksUseRequest',
        component: () => import('@/views/hooks/UseRequest.vue'),
        meta: {
          titleKey: 'menu.useRequest',
          breadcrumb: ['menu.hooks', 'menu.useRequest'],
        },
      },
      {
        path: '/hooks/useForm',
        name: 'HooksUseForm',
        component: () => import('@/views/hooks/UseForm.vue'),
        meta: {
          titleKey: 'menu.useForm',
          breadcrumb: ['menu.hooks', 'menu.useForm'],
        },
      },

      // ===== 多級菜單 =====
      {
        path: '/multi/1-1',
        name: 'Multi11',
        component: () => import('@/views/multi/Multi11.vue'),
        meta: {
          titleKey: 'menu.multi11',
          breadcrumb: ['menu.multi', 'menu.multi11'],
        },
      },
      {
        path: '/multi/1-2',
        name: 'Multi12',
        component: () => import('@/views/multi/Multi12.vue'),
        meta: {
          titleKey: 'menu.multi12',
          breadcrumb: ['menu.multi', 'menu.multi12'],
        },
      },
      {
        path: '/multi/2',
        name: 'Multi2',
        component: () => import('@/views/multi/Multi2.vue'),
        meta: {
          titleKey: 'menu.multi2',
          breadcrumb: ['menu.multi', 'menu.multi2'],
        },
      },

      // ===== 綜合示例（列表 / 編輯）=====
      {
        path: '/examples/payment',
        name: 'ExamplesList',
        component: () => import('@/views/examples/PaymentPage.vue'),
        meta: {
          titleKey: 'menu.payment',
          breadcrumb: ['menu.examples', 'menu.payment'],
        },
      },
      {
        path: '/examples/events',
        name: 'ExamplesEvents',
        component: () => import('@/views/examples/Events.vue'),
        meta: {
          titleKey: 'menu.events',
          breadcrumb: ['menu.examples', 'menu.events'],
        },
      },
      {
        path: '/examples/events/new',
        name: 'ExamplesEventNew',
        component: () => import('@/views/examples/components/EventsNew.vue'),
        meta: {
          titleKey: 'menu.eventNew',
          breadcrumb: ['menu.examples', 'menu.events', 'menu.eventNew'],
        },
      },
      {
        path: '/examples/events/:id/edit',
        name: 'ExamplesEventEdit',
        component: () => import('@/views/examples/components/EventsEdit.vue'),
        meta: {
          titleKey: 'menu.eventEdit',
          breadcrumb: ['menu.examples', 'menu.events', 'menu.eventEdit'],
        },
      },

      // ===== 錯誤頁面 =====
      {
        path: '/errors',
        name: 'Errors',
        component: () => import('@/views/errors/index.vue'),
        meta: {
          titleKey: 'menu.errors',
          breadcrumb: ['menu.errors'],
          public: true,  // 調整：讓錯誤頁不需要登入即可顯示
        },
        redirect: '/errors/400',
        children: [
          {
            path: '400',
            name: 'Error400',
            component: () => import('@/views/errors/400.vue'),
            meta: {
              titleKey: 'menu.errors400',
              breadcrumb: ['menu.errors', 'menu.errors400'],
            },
          },
          {
            path: '403',
            name: 'Error403',
            component: () => import('@/views/errors/403.vue'),
            meta: {
              titleKey: 'menu.errors403',
              breadcrumb: ['menu.errors', 'menu.errors403'],
            },
          },
          {
            path: '500',
            name: 'Error500',
            component: () => import('@/views/errors/500.vue'),
            meta: {
              titleKey: 'menu.errors500',
              breadcrumb: ['menu.errors', 'menu.errors500'],
            },
          },
        ],
      },

      // ===== 權限管理（頁面權限 / 按鈕權限）=====
      {
        path: '/permission/page',
        name: 'PermissionPage',
        component: () => import('@/views/permission/PagePermission.vue'),
        meta: {
          titleKey: 'menu.pagePermission',
          breadcrumb: ['menu.permission', 'menu.pagePermission'],
        },
      },


      // ===== 未匹配到的路由 → 直接導到 400 =====
      { path: '/:pathMatch(.*)*', redirect: '/errors/400' }
    ],
  },

  // 未匹配到的路由 → 導到錯誤頁
  { path: '/:pathMatch(.*)*', redirect: '/errors' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 登入守衛
router.beforeEach(async (to, from, next) => {
  const isAuthed = !!localStorage.getItem('token')

  // 已登入又去 /login → 回首頁
  if (to.name === 'Login' && isAuthed) return next('/')

  // 未登入要去非公開頁 → 去登入
  const isPublic = to.matched.some(r => r.meta?.public === true)
  if (!isPublic && !isAuthed) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  // 權限檢查（錯誤頁/登入頁/公開頁跳過）
  const skipCheck = isPublic || to.path.startsWith('/errors') || to.name === 'Login'
  if (skipCheck) return next()

  const perm = usePermStore()
  if (!perm.ready) {
    // 初次載入權限：嘗試從 Firestore → 失敗讀 localStorage → 否則預設全開
    await perm.load() // roleId 預設 'default'
  }

  if (!perm.can(to.path)) {
    return next('/errors/403')
  }

  next()
})

// 自動設定 <title>（優先用 titleKey）
router.afterEach((to) => {
  const appName = 'MyDevCraft Admin'
  const t = i18n.global.t
  const title =
    (to.meta?.titleKey && t(to.meta.titleKey)) ||
    to.meta?.title ||
    ''
  document.title = title ? `${title} - ${appName}` : appName
})

export default router

<template>
  <el-container class="h-full bg-gray-100">
    <el-aside
      width="240px"
      class="p-3 border-r border-gray-200 bg-white sticky top-0 h-screen"
    >
      <div class="font-bold mt-1.5 mb-3">專案文檔</div>

      <el-scrollbar class="h-[calc(100vh-160px)]">
        <ul>
          <li v-for="s in sections" :key="s.id">
            <a
              href="javascript:;"
              @click="scrollToSection(s.id)"
              :class="[
                'block px-2.5 py-2 rounded-lg text-gray-700 hover:bg-gray-100',
                activeId === s.id ? 'bg-blue-50 text-blue-700 font-semibold' : '',
              ]"
            >
              {{ s.title }}
            </a>
          </li>
        </ul>
      </el-scrollbar>
      <div class="mt-3 flex gap-2">
        <el-button type="primary" plain @click="scrollToSection('quickstart')"
          >快速開始</el-button
        >
        <el-button @click="scrollToSection('api')">API 規範</el-button>
      </div>
    </el-aside>

    <!-- 右側：內容 -->
    <el-main class="pt-4 pr-5 pb-10 pl-5" ref="mainRef">
      <div class="flex items-center justify-between">
        <div class="left">
          <span class="text-xl font-extrabold">後台控制系統 — 文檔</span>
          <p class="text-gray-400 pt-4">作品集用｜快速理解版本</p>
        </div>
        <div class="right">
          <el-input
            v-model="q"
            placeholder="全文搜尋（標題/段落）"
            clearable
            @input="onSearchInput"
            @keydown.enter="onSearchEnter"
            style="width: 260px"
          >
            <template #suffix>
              <el-button text @click="onSearchEnter">
                <i class="i-ep-search" />
              </el-button>
            </template>
          </el-input>
        </div>
      </div>

      <el-divider />

      <!-- ① 專案總覽 -->
      <section id="overview" class="mt-5 scroll-mt-20">
        <el-card shadow="never">
          <template #header>
            <div class="font-bold">專案總覽</div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="專案定位">
              企業後台管理（帳號、權限、設定、報表）
            </el-descriptions-item>
            <el-descriptions-item label="職責">
              前端 100%（畫面、架構、路由/權限、UI、API 串接、報表、FireBase）
            </el-descriptions-item>
            <el-descriptions-item label="技術棧">
              Vue 3、Vite、Element-Plus、Pinia、Vue Router、ECharts、Taiwind CSS
            </el-descriptions-item>
            <el-descriptions-item label="Repo">
              <el-link type="primary" :underline="false">（可放 Git 連結或留白）</el-link>
            </el-descriptions-item>
          </el-descriptions>

          <el-alert
            type="info"
            :closable="false"
            description="admin/admin（管理員）；1234/1234（一般職員）"
            show-icon
          />
        </el-card>
      </section>

      <!-- ② 快速開始 -->
      <section id="quickstart" class="mt-5 scroll-mt-20">
        <el-card shadow="never">
          <template #header><div class="font-bold">快速開始</div></template>

          <h4>環境需求</h4>
          <ul class="mt-1.5 mb-3 ml-[18px] list-disc">
            <li>Node 18+、npm 9+</li>
          </ul>

          <h4>指令</h4>
          <CodeBlock :code="cmds" lang="bash" />

          <h4>.env.local 範例</h4>
          <CodeBlock :code="envSample" lang="ini" />
        </el-card>
      </section>

      <!-- ③ 架構與路由 -->
      <section id="architecture" class="mt-5 scroll-mt-20">
        <el-card shadow="never">
          <template #header><div class="font-bold">架構與路由</div></template>

          <h4>目錄結構（節錄）</h4>
          <CodeBlock :code="tree" lang="text" />

          <h4>路由重點</h4>
          <ul class="mt-1.5 mb-3 ml-[18px] list-disc">
            <li>登入 → 依角色載入可見選單與可訪問路由</li>
            <li>未授權路由 → 統一導向 403 / 404</li>
            <li>外連（文件）支援新分頁</li>
          </ul>
        </el-card>
      </section>

      <!-- ④ 權限（RBAC） -->
      <section id="permission" class="mt-5 scroll-mt-20">
        <el-card shadow="never">
          <template #header><div class="font-bold">權限（RBAC）</div></template>

          <el-table :data="permRows" border>
            <el-table-column prop="menu" label="功能/選單" />
            <el-table-column prop="admin" label="Admin" />
            <el-table-column prop="staff" label="Staff" />
          </el-table>

          <el-alert
            class="mt-3"
            type="warning"
            :closable="false"
            show-icon
            title="實作說明"
            description="根據 token 內的權限旗標（如 is_enable_*）動態生成側欄與可訪問路由；前端與後端雙重校驗。"
          />
        </el-card>
      </section>

      <!-- ⑤ API 規範 -->
      <section id="api" class="mt-5 scroll-mt-20">
        <el-card shadow="never">
          <template #header><div class="font-bold">API 規範</div></template>

          <h4>統一回應格式</h4>
          <CodeBlock :code="apiSchema" lang="json" />

          <h4>範例：分頁列表</h4>
          <CodeBlock :code="apiExample" lang="json" />

          <h4>錯誤碼</h4>
          <el-table :data="errRows" border>
            <el-table-column prop="code" label="code" width="100" />
            <el-table-column prop="meaning" label="說明" />
            <el-table-column prop="ui" label="前端處理" />
          </el-table>
        </el-card>
      </section>

      <!-- ⑥ UI/UX 規範 -->
      <section id="ui" class="mt-5 scroll-mt-20">
        <el-card shadow="never">
          <template #header><div class="font-bold">UI / UX 規範</div></template>
          <ul class="mt-1.5 mb-3 ml-[18px] list-disc">
            <li>表單校驗：必填、格式、即時提示；提交前再次校驗</li>
            <li>
              通知規則：成功 → message.success；失敗 → message.error（後端 message）
            </li>
            <li>表格：固定表頭、分頁、空狀態、Loading skeleton</li>
            <li>多語：i18n key 命名規則與放置位置</li>
          </ul>
        </el-card>
      </section>

      <!-- ⑦ 部署與環境 -->
      <section id="deploy" class="mt-5 scroll-mt-20">
        <el-card shadow="never">
          <template #header><div class="font-bold">部署與環境</div></template>
          <ul class="mt-1.5 mb-3 ml-[18px] list-disc">
            <li>環境：dev / sit / uat / prod；差異只在 .env 與後端域名</li>
            <li>CI/CD：push → build → 部署（可附圖或流程）</li>
            <li>日誌：本地顯示 console；SIT/PRD 以環境變數關閉 verbose</li>
          </ul>
        </el-card>
      </section>

      <!-- ⑧ Changelog / 已知問題 -->
      <section id="changelog" class="mt-5 scroll-mt-20">
        <el-card shadow="never">
          <template #header><div class="font-bold">Changelog / 已知問題</div></template>
          <ul class="mt-1.5 mb-3 ml-[18px] list-disc">
            <li>v1.0.0：初版（登入、角色權限、使用者管理、報表）</li>
            <li>v1.1.0：加入 ECharts 儀表板、導出 CSV</li>
          </ul>
          <el-divider />
          <ul class="mt-1.5 mb-3 ml-[18px] list-disc">
            <li>已知：Safari 低版本 Tooltip 偶爾不消失（待修）</li>
          </ul>
        </el-card>
      </section>

      <!-- 變更：移除 .foot-space -->
      <div class="h-[60px]" />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, onMounted, defineComponent } from "vue";

const sections = [
  { id: "overview", title: "專案總覽" },
  { id: "quickstart", title: "快速開始" },
  { id: "architecture", title: "架構與路由" },
  { id: "permission", title: "權限（RBAC）" },
  { id: "api", title: "API 規範" },
  { id: "ui", title: "UI / UX 規範" },
  { id: "deploy", title: "部署與環境" },
  { id: "changelog", title: "Changelog / 已知問題" },
];

const mainRef = ref(null);
const activeId = ref("overview");
const q = ref("");

const cmds = `# 安裝
npm i
# 開發
npm run dev
# 打包
npm run build
# 預覽
npm run preview`;

const envSample = `VITE_ENV=dev
VITE_API_BASE_URL=https://sit-api.example.com/v1
VITE_IMAGE_URL=https://static.example.com/images/
VITE_WS_URL=wss://sit-api.example.com
`;

const tree = `src/
  api/              # API 模組（單一職責：請求 + 回傳標準化）
  components/       # 可復用 UI
  router/           # 路由與守衛（登入、權限）
  stores/           # Pinia（使用者、設定、權限）
  views/
    dashboard/
    users/
    docs/           # <- 本頁
`;

const apiSchema = `{
  "code": 0,
  "message": "",
  "data": {}
}`;

const apiExample = `{
  "code": 0,
  "message": "",
  "data": {
    "list": [
      { "id": 1, "name": "Alice", "role": "admin" },
      { "id": 2, "name": "Bob", "role": "staff" }
    ],
    "page": 1,
    "pageSize": 10,
    "total": 27
  }
}`;

const permRows = [
  { menu: "使用者管理", admin: "讀/寫", staff: "讀" },
  { menu: "角色權限", admin: "讀/寫", staff: "-" },
  { menu: "報表儀表板", admin: "讀", staff: "讀" },
  { menu: "系統設定", admin: "讀/寫", staff: "-" },
];

const errRows = [
  { code: 0, meaning: "成功", ui: "正常流程" },
  { code: 401, meaning: "未登入/登入逾時", ui: "跳登入、帶回原路由" },
  { code: 403, meaning: "無權限", ui: "提示並導回首頁或上一頁" },
  { code: 422, meaning: "參數不正確", ui: "顯示後端 message；表單高亮錯誤欄位" },
  { code: 500, meaning: "伺服器錯誤", ui: "toast + 上報（如有）" },
];

// 固定頂欄高度（如果未來有真正的 sticky header，可換成實測高度）
const HEADER_OFFSET = 64;

function getScrollerEl() {
  return (
    (mainRef.value && (mainRef.value.$el || mainRef.value)) || document.scrollingElement
  );
}

function getHeaderOffset() {
  const fixed = document.querySelector(".sticky-header, .fixed-header");
  return fixed ? fixed.getBoundingClientRect().height : HEADER_OFFSET || 0;
}

const scrollLock = { active: false, until: 0 };

// ✅ 核心：在「滾動容器」中平滑捲動到對應區塊
function scrollToSection(id) {
  const target = document.getElementById(id);
  const scroller = getScrollerEl();
  if (!target || !scroller) return;

  const scrollerRect = scroller.getBoundingClientRect?.() ?? { top: 0 };
  const targetRect = target.getBoundingClientRect();
  const delta = targetRect.top - scrollerRect.top - getHeaderOffset() - 8;
  const destTop = (scroller.scrollTop || 0) + delta;

  // 鎖定一段時間，避免滾動中被誤判「下一節」
  scrollLock.active = true;
  scrollLock.until = performance.now() + 800; // 你可調整 600~1000ms

  // 先手動設，立即高亮
  activeId.value = id;

  if (typeof scroller.scrollTo === "function") {
    scroller.scrollTo({ top: destTop, behavior: "smooth" });
  } else {
    scroller.scrollTop = destTop;
  }

  // 超時解鎖（保底）
  setTimeout(() => (scrollLock.active = false), 900);
}

function updateActiveByScroll() {
  if (scrollLock.active && performance.now() < scrollLock.until) return;

  const scroller = getScrollerEl();
  const scrollerRect = scroller.getBoundingClientRect?.() ?? { top: 0 };
  const offset = getHeaderOffset() + 10;

  // 視 DOM 順序，找出「最後一個 top <= 0」的章節
  let current = sections[0]?.id;
  for (const s of sections) {
    const el = document.getElementById(s.id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top - scrollerRect.top - offset;
    if (top <= 0) current = s.id;
    else break;
  }
  activeId.value = current;
}

onMounted(() => {
  const scroller = getScrollerEl();
  scroller.addEventListener("scroll", updateActiveByScroll, { passive: true });
  // 初次進入也跑一次
  updateActiveByScroll();
});

// ====== 搜尋 ======
function findFirstMatchId(keyword) {
  const kw = (keyword || "").trim().toLowerCase();
  if (!kw) return null;
  for (const s of sections) {
    const el = document.getElementById(s.id);
    if (el && el.innerText.toLowerCase().includes(kw)) return s.id;
  }
  return null;
}

function onSearchInput() {
  // 想做即時定位再呼叫 scrollToSection(findFirstMatchId(q.value))
}

function onSearchEnter() {
  const id = findFirstMatchId(q.value);
  if (id) scrollToSection(id);
}

// 小組件：代碼塊 + 一鍵複製（Element-Plus 保留、外觀用 Tailwind）
const CodeBlock = defineComponent({
  name: "CodeBlock",
  props: {
    code: { type: String, required: true },
    lang: { type: String, default: "text" },
  },
  setup(props) {
    const copied = ref(false);
    const copy = async () => {
      await navigator.clipboard.writeText(props.code);
      copied.value = true;
      setTimeout(() => (copied.value = false), 1200);
    };
    return { props, copied, copy };
  },
  template: `
    <div class="bg-[#0b1020] text-gray-200 rounded-lg my-2 overflow-hidden">
      <div class="flex items-center justify-between px-2.5 py-1.5 border-b border-gray-900">
        <span class="text-xs opacity-70">{{ lang.toUpperCase() }}</span>
        <el-button size="small" @click="copy">{{ copied ? '已複製' : '複製' }}</el-button>
      </div>
      <pre class="m-0 p-3 overflow-auto font-mono text-xs"><code>{{ code }}</code></pre>
    </div>
  `,
});
</script>

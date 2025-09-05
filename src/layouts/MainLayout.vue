<!-- src/layouts/AdminLayout.vue（或 MainLayout.vue） -->
<template>
  <el-config-provider :locale="elLocale">
    <el-container class="h-screen">
      <el-aside
        id="app-sidebar"
        :width="collapsed ? '64px' : '220px'"
        class="sidebar-aside"
      >
        <DefaultSidebar :collapsed="collapsed" @select="handleMenuSelect" />
      </el-aside>

      <el-container>
        <el-header id="app-header" class="header-bar">
          <DefaultHeader
            :collapsed="collapsed"
            :breadcrumb="breadcrumb"
            username="admin"
            @toggle="collapsed = !collapsed"
            @logout="handleLogout"
            @change-lang="handleChangeLang"
          />
        </el-header>

        <el-main class="main-area">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import DefaultHeader from "./components/DefaultHeader.vue";
import DefaultSidebar from "./components/DefaultSidebar.vue";
import zhTw from "element-plus/es/locale/lang/zh-tw";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

const collapsed = ref(false);

/* Element Plus 語系對應 */
const elLocale = computed(() => {
  if (locale.value === "zh-CN") return zhCn;
  if (locale.value === "en-US") return en;
  return zhTw;
});

/* ✅ 自動產生麵包屑（會隨路由與語言變動） */
const breadcrumb = computed(() => {
  const b = route.meta?.breadcrumb;
  if (Array.isArray(b) && b.length) {
    // 支援兩種寫法：
    // 1) 直接寫字串：['首頁','分析頁'] -> 原樣輸出
    // 2) 寫成 i18n key：['menu.home','menu.analysis'] -> 走 t()
    return b.map((item) => {
      if (typeof item !== "string") return ""; // 非預期型別直接忽略
      // 判斷像 'menu.xxx' 這樣的 key 就翻譯，否則當作現成字串
      return item.includes(".") ? t(item) : item;
    });
  }
  // 沒有 breadcrumb 就退回「首頁 / 當前頁標題」
  const home = t("menu.home");
  const title = route.meta?.titleKey ? t(route.meta.titleKey) : route.meta?.title || "";
  return title ? [home, title] : [home];
});

/* 事件 */
const handleMenuSelect = (key) => {
  if (!key || key === "#") return;
  router.push(key);
};
const handleLogout = () => {
  localStorage.removeItem("token");
  router.replace("/login");
};
const handleChangeLang = (lang) => {
  // 你現有的 setLocale(...) 若有就呼叫它；這裡假設用全域的 i18n
  locale.value = lang;
};

onMounted(() => {
  // 可選：這裡如果有 dayjs 語系同步也一併處理
});
</script>

<style scoped>
.sidebar-aside {
  padding: 0;
  background: linear-gradient(180deg, #0f1d2e 0%, #0b1726 100%);
  color: #fff;
  border-right: 1px solid #0f2742;
  transition: width 0.2s ease;
}
.header-bar {
  height: 56px;
  padding: 0 12px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
}
.main-area {
  background: #f5f7fa;
  padding: 16px;
}
</style>

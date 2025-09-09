<template>
  <div class="h-full flex flex-col">
    <div id="app-logo" class="logo-wrap" :class="{ collapsed }">
      <div class="logo-icon">
        <el-icon size="20"><Menu /></el-icon>
      </div>
      <div class="logo-text" v-show="!collapsed">MyDevCraft</div>
    </div>

    <!-- 可滾動選單 -->
    <el-scrollbar class="flex-1">
      <el-menu
        :collapse="collapsed"
        :collapse-transition="false"
        background-color="transparent"
        text-color="#c8d3e1"
        active-text-color="#ffffff"
        class="el-menu-vertical-demo side-menu"
        :default-active="active"
        @select="onSelect"
      >
        <!-- 首頁（含子頁：分析頁、工作台） -->
        <el-sub-menu index="home">
          <template #title>
            <el-icon><House /></el-icon>
            <!-- 調整：文案改為 t('menu.home') -->
            <span>{{ t("menu.home") }}</span>
          </template>
          <el-menu-item index="/dashboard/analysis">
            <!-- 調整：t('menu.analysis') -->
            <span>{{ t("menu.analysis") }}</span>
          </el-menu-item>
          <el-menu-item index="/dashboard/workbench">
            <!-- 調整：t('menu.workbench') -->
            <span>{{ t("menu.workbench") }}</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/docs">
          <el-icon><Document /></el-icon>
          <!-- 調整：t('menu.docs') -->
          <span>{{ t("menu.docs") }}</span>
        </el-menu-item>

        <el-menu-item index="/guide">
          <el-icon><Guide /></el-icon>
          <!-- 調整：t('menu.guide') -->
          <span>{{ t("menu.guide") }}</span>
        </el-menu-item>

        <el-sub-menu index="components">
          <template #title>
            <el-icon><Setting /></el-icon>
            <!-- 調整：t('menu.components') -->
            <span>{{ t("menu.components") }}</span>
          </template>
          <el-menu-item index="/components/form">{{ t("menu.form") }}</el-menu-item>
          <el-menu-item index="/components/table">{{ t("menu.table") }}</el-menu-item>
          <el-menu-item index="/components/upload">{{ t("menu.upload") }}</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="features">
          <template #title>
            <el-icon><Tools /></el-icon>
            <!-- 調整：t('menu.features') -->
            <span>{{ t("menu.features") }}</span>
          </template>
          <el-menu-item index="/features/editor">{{ t("menu.editor") }}</el-menu-item>
          <el-menu-item index="/features/push">{{ t("menu.push") }}</el-menu-item>
          <el-menu-item index="/features/seo">{{ t("menu.seo") }}</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="hooks">
          <template #title>
            <el-icon><Tools /></el-icon>
            <!-- 調整：t('menu.hooks') -->
            <span>{{ t("menu.hooks") }}</span>
          </template>
          <el-menu-item index="/hooks/useRequest">{{
            t("menu.useRequest")
          }}</el-menu-item>
          <el-menu-item index="/hooks/useForm">{{ t("menu.useForm") }}</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="multi">
          <template #title>
            <el-icon><Menu /></el-icon>
            <!-- 調整：t('menu.multi') -->
            <span>{{ t("menu.multi") }}</span>
          </template>
          <el-sub-menu index="multi-1">
            <template #title>{{ t("menu.multi") }} - 1</template>
            <el-menu-item index="/multi/1-1">{{ t("menu.multi11") }}</el-menu-item>
            <el-menu-item index="/multi/1-2">{{ t("menu.multi12") }}</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/multi/2">{{ t("menu.multi2") }}</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="examples">
          <template #title>
            <el-icon><Menu /></el-icon>
            <!-- 調整：t('menu.examples') -->
            <span>{{ t("menu.examples") }}</span>
          </template>
          <el-menu-item index="/examples/list">{{ t("menu.list") }}</el-menu-item>
          <el-menu-item index="/examples/edit">{{ t("menu.edit") }}</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/errors">
          <el-icon><Warning /></el-icon>
          <!-- 調整：t('menu.errors') -->
          <span>{{ t("menu.errors") }}</span>
        </el-menu-item>

        <el-sub-menu index="permission">
          <template #title>
            <el-icon><Lock /></el-icon>
            <!-- 調整：t('menu.permission') -->
            <span>{{ t("menu.permission") }}</span>
          </template>
          <el-menu-item index="/permission/page">{{
            t("menu.pagePermission")
          }}</el-menu-item>
          <el-menu-item index="/permission/button">{{
            t("menu.buttonPermission")
          }}</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
/* 新增：i18n 的 t，與路由同步高亮 */
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n"; // 新增：取用 t()
import { useRoute } from "vue-router"; // 新增：同步當前路由
import {
  Menu,
  House,
  Document,
  Setting,
  Tools,
  Guide,
  Warning,
  Lock,
} from "@element-plus/icons-vue";

const { t } = useI18n(); // 新增：t()

const props = defineProps({
  collapsed: { type: Boolean, default: false },
});
const emit = defineEmits(["select"]);

const route = useRoute(); // 新增：當前路由
const active = ref(route.path || "/dashboard/analysis"); // 預設高亮為當前路由

const onSelect = (key) => emit("select", key);

// 新增：路由變化時同步高亮
watch(
  () => route.path,
  (p) => (active.value = p),
  { immediate: true }
);

// 可依收合狀態做額外處理（此處保留）
watch(
  () => props.collapsed,
  () => void 0
);

onMounted(() => {
  // 初次進入同步一次
  active.value = route.path || "/dashboard/analysis";
});
</script>

<style scoped>
.logo-wrap {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 10px;
  color: #e6eefc;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.logo-wrap.collapsed {
  justify-content: center;
}
.logo-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}
.logo-text {
  font-weight: 700;
  letter-spacing: 0.2px;
}
.side-menu {
  border-right: none;
  padding: 8px 6px 12px 6px;
}
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  border-radius: 6px;
  margin: 2px 6px;
}
:deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.12) !important;
}
</style>

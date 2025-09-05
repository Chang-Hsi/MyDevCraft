<template>
  <div class="w-full flex items-center justify-between">
    <!-- 左側：折疊鍵 + 麵包屑 -->
    <div class="flex items-center gap-3">
      <el-button link @click="$emit('toggle')">
        <el-icon size="20">
          <component :is="collapsed ? Expand : Fold" />
        </el-icon>
      </el-button>

      <el-breadcrumb id="app-breadcrumb" separator="/">
        <el-breadcrumb-item v-for="(b, i) in breadcrumb" :key="i">{{
          b
        }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右側：工具列 -->
    <div class="flex items-center gap-2">
      <!-- 全螢幕 -->
      <el-tooltip :content="t('header.fullscreen')" placement="bottom">
        <el-button id="app-fullscreen" link @click="toggleFull">
          <el-icon size="18"><FullScreen /></el-icon>
        </el-button>
      </el-tooltip>

      <!-- 語言 -->
      <el-dropdown id="app-lang" @command="(lang) => $emit('change-lang', lang)">
        <span class="el-dropdown-link flex items-center gap-1">
          <el-icon><Menu /></el-icon>
          <span class="text-sm">{{ t("header.language") }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="zh-TW">繁體中文</el-dropdown-item>
            <el-dropdown-item command="zh-CN">简体中文</el-dropdown-item>
            <el-dropdown-item command="en-US">English</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 使用者 -->
      <el-dropdown id="app-user">
        <div class="flex items-center gap-2 cursor-pointer">
          <el-avatar
            :size="28"
            src="https://api.iconify.design/mdi:account-circle.svg?color=%239ca3af"
          />
          <span class="text-sm text-gray-700">{{ username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>{{ t("header.profile") }}</el-dropdown-item>
            <el-dropdown-item divided @click="$emit('logout')">
              {{ t("header.logout") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n"; // 新增：取用 t
import { Fold, Expand, FullScreen, ArrowDown, Menu } from "@element-plus/icons-vue";

defineProps({
  collapsed: { type: Boolean, default: false },
  breadcrumb: { type: Array, default: () => [] },
  username: { type: String, default: "admin" },
});

const { t } = useI18n(); // 新增：取得 t（模板用 t('...')）

const isFull = ref(false);
const onFullChange = () => {
  isFull.value = !!document.fullscreenElement;
};
const toggleFull = async () => {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch (e) {
    console.warn("[DefaultHeader] Fullscreen 失敗：", e);
  }
};
onMounted(() => document.addEventListener("fullscreenchange", onFullChange));
onBeforeUnmount(() => document.removeEventListener("fullscreenchange", onFullChange));
</script>

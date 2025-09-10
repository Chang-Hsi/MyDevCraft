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
        <el-sub-menu
          index="home"
          :disabled="groupDisabled('/dashboard/analysis', '/dashboard/workbench')"
        >
          <template #title>
            <el-icon><House /></el-icon>
            <span>{{ t("menu.home") }}</span>
          </template>
          <el-menu-item
            index="/dashboard/analysis"
            :disabled="!can('/dashboard/analysis')"
          >
            <span>{{ t("menu.analysis") }}</span>
          </el-menu-item>
          <el-menu-item
            index="/dashboard/workbench"
            :disabled="!can('/dashboard/workbench')"
          >
            <span>{{ t("menu.workbench") }}</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/docs" :disabled="!can('/docs')">
          <el-icon><Document /></el-icon>
          <span>{{ t("menu.docs") }}</span>
        </el-menu-item>

        <el-menu-item index="/guide" :disabled="!can('/guide')">
          <el-icon><Guide /></el-icon>
          <span>{{ t("menu.guide") }}</span>
        </el-menu-item>

        <el-sub-menu
          index="components"
          :disabled="
            groupDisabled('/components/form', '/components/table', '/components/upload')
          "
        >
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>{{ t("menu.components") }}</span>
          </template>
          <el-menu-item index="/components/form" :disabled="!can('/components/form')">
            {{ t("menu.form") }}
          </el-menu-item>
          <el-menu-item index="/components/table" :disabled="!can('/components/table')">
            {{ t("menu.table") }}
          </el-menu-item>
          <el-menu-item index="/components/upload" :disabled="!can('/components/upload')">
            {{ t("menu.upload") }}
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu
          index="features"
          :disabled="groupDisabled('/features/editor', '/features/push', '/features/seo')"
        >
          <template #title>
            <el-icon><Tools /></el-icon>
            <span>{{ t("menu.features") }}</span>
          </template>
          <el-menu-item index="/features/editor" :disabled="!can('/features/editor')">
            {{ t("menu.editor") }}
          </el-menu-item>
          <el-menu-item index="/features/push" :disabled="!can('/features/push')">
            {{ t("menu.push") }}
          </el-menu-item>
          <el-menu-item index="/features/seo" :disabled="!can('/features/seo')">
            {{ t("menu.seo") }}
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu
          index="hooks"
          :disabled="groupDisabled('/hooks/useRequest', '/hooks/useForm')"
        >
          <template #title>
            <el-icon><Tools /></el-icon>
            <span>{{ t("menu.hooks") }}</span>
          </template>
          <el-menu-item index="/hooks/useRequest" :disabled="!can('/hooks/useRequest')">
            {{ t("menu.useRequest") }}
          </el-menu-item>
          <el-menu-item index="/hooks/useForm" :disabled="!can('/hooks/useForm')">
            {{ t("menu.useForm") }}
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu
          index="multi"
          :disabled="groupDisabled('/multi/1-1', '/multi/1-2', '/multi/2')"
        >
          <template #title>
            <el-icon><Menu /></el-icon>
            <span>{{ t("menu.multi") }}</span>
          </template>
          <el-sub-menu
            index="multi-1"
            :disabled="groupDisabled('/multi/1-1', '/multi/1-2')"
          >
            <template #title>{{ t("menu.multi") }} - 1</template>
            <el-menu-item index="/multi/1-1" :disabled="!can('/multi/1-1')">
              {{ t("menu.multi11") }}
            </el-menu-item>
            <el-menu-item index="/multi/1-2" :disabled="!can('/multi/1-2')">
              {{ t("menu.multi12") }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/multi/2" :disabled="!can('/multi/2')">
            {{ t("menu.multi2") }}
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu
          index="examples"
          :disabled="groupDisabled('/examples/payment', '/examples/events')"
        >
          <template #title>
            <el-icon><Menu /></el-icon>
            <span>{{ t("menu.examples") }}</span>
          </template>
          <el-menu-item index="/examples/payment" :disabled="!can('/examples/payment')">
            {{ t("menu.payment") }}
          </el-menu-item>
          <el-menu-item index="/examples/events" :disabled="!can('/examples/events')">
            {{ t("menu.events") }}
          </el-menu-item>
        </el-sub-menu>

        <!-- 錯誤頁：通常保持可用，不套權限 -->
        <el-sub-menu index="errors">
          <template #title>
            <el-icon><Warning /></el-icon>
            <span>{{ t("menu.errors") }}</span>
          </template>
          <el-menu-item index="/errors/400">{{ t("menu.errors400") }}</el-menu-item>
          <el-menu-item index="/errors/403">{{ t("menu.errors403") }}</el-menu-item>
          <el-menu-item index="/errors/500">{{ t("menu.errors500") }}</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="permission" :disabled="groupDisabled('/permission/page')">
          <template #title>
            <el-icon><Lock /></el-icon>
            <span>{{ t("menu.permission") }}</span>
          </template>
          <el-menu-item index="/permission/page" :disabled="!can('/permission/page')">
            {{ t("menu.pagePermission") }}
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { usePermStore } from "@/stores/perm"; // ← 你的 Pinia 權限 store（JS）
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

const { t } = useI18n();

const props = defineProps({ collapsed: { type: Boolean, default: false } });
const emit = defineEmits(["select"]);

const route = useRoute();
const active = ref(route.path || "/dashboard/analysis");

const perm = usePermStore();
// 單一路徑是否可用
const can = (path) => (perm.can ? perm.can(path) : true);
// 一組路徑只要有一個可用就不禁用父層
const groupDisabled = (...paths) => paths.every((p) => !can(p));

const onSelect = (key) => emit("select", key);

watch(
  () => route.path,
  (p) => (active.value = p),
  { immediate: true }
);
watch(
  () => props.collapsed,
  () => void 0
);

onMounted(() => {
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

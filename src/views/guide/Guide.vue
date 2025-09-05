<template>
  <el-card
    :body-style="{ padding: '12px 16px' }"
    class="rounded-xl border border-gray-200 shadow-sm"
    shadow="never"
  >
    <!-- 標題 + 說明圖 -->
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-2">
        <span class="text-lg font-semibold">{{ t("pages.guide.title") }}</span>
        <el-tooltip effect="dark" :content="t('pages.guide.hint')" placement="right">
          <img src="@/assets/svg/guide.svg" class="w-40" alt="guide" />
        </el-tooltip>
      </div>

      <!-- 可選：是否顯示進度 -->
      <div class="flex items-center gap-2">
        <el-switch v-model="withProgress" :active-text="t('pages.guide.progress')" />
      </div>
    </div>

    <el-divider style="margin: 12px 0" />

    <div class="text-gray-500 text-sm leading-6 py-4">
      <el-button type="primary" @click="startTour">
        {{ t("pages.guide.start") }}
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const { t } = useI18n();

const $ = (sel) => document.querySelector(sel);
const exists = (sel) => !!$(sel);

const withProgress = ref(true);

function getSteps() {
  const steps = [
    exists("#app-sidebar") && {
      element: "#app-sidebar",
      popover: {
        title: t("pages.guide.steps.sidebar.title"),
        description: t("pages.guide.steps.sidebar.desc"),
        side: "right",
        align: "start",
      },
    },
    exists("#app-breadcrumb") && {
      element: "#app-breadcrumb",
      popover: {
        title: t("pages.guide.steps.breadcrumb.title"),
        description: t("pages.guide.steps.breadcrumb.desc"),
        side: "bottom",
        align: "start",
      },
    },
    exists("#app-lang") && {
      element: "#app-lang",
      popover: {
        title: t("pages.guide.steps.lang.title"),
        description: t("pages.guide.steps.lang.desc"),
        side: "bottom",
        align: "center",
      },
    },
    exists("#app-fullscreen") && {
      element: "#app-fullscreen",
      popover: {
        title: t("pages.guide.steps.fullscreen.title"),
        description: t("pages.guide.steps.fullscreen.desc"),
        side: "bottom",
        align: "center",
      },
    },
    exists("#app-user") && {
      element: "#app-user",
      popover: {
        title: t("pages.guide.steps.user.title"),
        description: t("pages.guide.steps.user.desc"),
        side: "bottom",
        align: "end",
      },
    },
  ];
  return steps.filter(Boolean);
}

function startTour() {
  const d = driver({
    overlayColor: "rgba(0,0,0,0.45)",
    stagePadding: 6,
    allowClose: true,
    showProgress: withProgress.value,
    nextBtnText: t("pages.guide.driver.next"),
    prevBtnText: t("pages.guide.driver.prev"),
    doneBtnText: t("pages.guide.driver.done"),
    onHighlightStarted: ({ element }) => {
      try {
        element?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      } catch (_) {}
    },
  });

  const steps = getSteps();
  if (!steps.length) return;
  d.setSteps(steps);
  d.drive();
}
</script>

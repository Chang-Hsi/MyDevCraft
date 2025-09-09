<template>
  <div class="p-6 space-y-6">
    <!-- 頂部工具列 -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-bold">SEO 管理</h2>
        <el-tag type="success" effect="light">Phase 1 · MVP</el-tag>
      </div>
      <div class="flex items-center gap-2">
        <!-- 註解：呼叫 Pinia 動作 -->
        <el-button @click="onReset">重置</el-button>
        <el-button type="primary" @click="onSave">儲存</el-button>
      </div>
    </div>

    <!-- 操作說明 -->
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="rounded-lg"
      description="先從「快速開始」完成 3 個步驟，網站就有可用的預設 SEO；之後再到其他分頁微調。"
      title="建議流程：快速開始 → 全站預設 → 內容模板 → Sitemap/Robots → 預覽與檢核"
    />

    <!-- 五個分頁，改為五個子組件 -->
    <el-tabs v-model="tab">
      <el-tab-pane label="快速開始" name="quickstart">
        <SeoQuickStart />
      </el-tab-pane>

      <el-tab-pane label="全站預設" name="defaults">
        <SeoDefaults />
      </el-tab-pane>

      <el-tab-pane label="內容模板" name="templates">
        <SeoTemplates />
      </el-tab-pane>

      <el-tab-pane label="Sitemap / Robots" name="sitemap">
        <SeoSitemapRobots />
      </el-tab-pane>

      <el-tab-pane label="預覽與檢核" name="preview">
        <SeoPreviewAudit />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
// 說明：父容器，僅負責切分 Tab 與提供「儲存/重置」入口
import { ref } from "vue";
import { useSeoStore } from "@/stores/seo";

// 子組件
import SeoQuickStart from "./components/SeoQuickStart.vue";
import SeoDefaults from "./components/SeoDefaults.vue";
import SeoTemplates from "./components/SeoTemplates.vue";
import SeoSitemapRobots from "./components/SeoSitemapRobots.vue";
import SeoPreviewAudit from "./components/SeoPreviewAudit.vue";

const tab = ref("quickstart");
const store = useSeoStore();

// 事件：儲存
const onSave = () => {
  store.saveAll();
  // 註解：此處僅示意，可搭配 ElMessage 成功提示
};

// 事件：重置
const onReset = () => {
  store.resetAll();
};
</script>

<style scoped>
/* 小修飾：維持簡潔 */
</style>

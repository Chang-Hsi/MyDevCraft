<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- Sitemap -->
    <el-card shadow="never" class="rounded-2xl">
      <template #header><div class="font-semibold">Sitemap</div></template>
      <el-form :model="sitemap" label-width="130px" class="mt-2">
        <el-form-item label="自動產出">
          <el-switch v-model="sitemap.enabled" />
        </el-form-item>
        <el-form-item label="Ping 搜尋引擎">
          <el-switch v-model="sitemap.pingEnabled" />
        </el-form-item>
        <el-form-item label="上次生成">
          <div class="flex items-center gap-3">
            <el-tag type="success">{{ store.formatTime(sitemap.lastBuiltAt) }}</el-tag>
            <el-button size="small" @click="store.buildSitemapNow()">立即重建</el-button>
          </div>
        </el-form-item>
        <el-divider />
        <div class="text-xs text-gray-500">
          MVP 版尚未拆分多個 sitemap（文章/產品/分類/圖片），後續可擴充。
        </div>
      </el-form>
    </el-card>

    <!-- Robots.txt -->
    <el-card shadow="never" class="rounded-2xl">
      <template #header><div class="font-semibold">Robots.txt</div></template>
      <el-form :model="robots" label-width="130px" class="mt-2">
        <el-form-item label="額外規則（附加）">
          <el-input
            v-model="robots.extra"
            type="textarea"
            :rows="8"
            placeholder="自訂追加內容（選填）"
          />
        </el-form-item>
      </el-form>
      <el-alert
        class="mt-2"
        title="dev/stage 環境建議預設 noindex；正式站開放索引。"
        type="warning"
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script setup>
// 說明：Sitemap 與 Robots 設定
import { storeToRefs } from "pinia";
import { useSeoStore } from "@/stores/seo";

const store = useSeoStore();
const { sitemap, robots } = storeToRefs(store);
</script>

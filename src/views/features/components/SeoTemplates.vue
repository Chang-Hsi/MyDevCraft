<template>
  <div>
    <el-alert
      type="success"
      :closable="false"
      show-icon
      class="mb-4 rounded-lg"
      description="不同型別可套不同模板；真的有特例，再到單頁覆寫。"
      title="模板 = 批次自動化"
    />

    <el-collapse v-model="activeTypes" class="rounded-xl">
      <el-collapse-item v-for="def in typeDefs" :key="def.key" :name="def.key">
        <template #title>
          <div class="flex items-center gap-2 px-8 py-2">
            <span class="font-medium">{{ def.label }}</span>
            <el-tag size="small" type="info" effect="plain">{{ def.desc }}</el-tag>
          </div>
        </template>

        <el-form :model="contentTemplates[def.key]" label-width="130px" class="px-2 py-2">
          <el-form-item label="啟用模板">
            <el-switch v-model="contentTemplates[def.key].enabled" />
          </el-form-item>

          <el-form-item label="Title 模板">
            <el-input
              v-model="contentTemplates[def.key].title"
              :disabled="!contentTemplates[def.key].enabled"
            />
          </el-form-item>

          <el-form-item label="描述模板">
            <el-input
              v-model="contentTemplates[def.key].desc"
              type="textarea"
              :rows="3"
              :disabled="!contentTemplates[def.key].enabled"
            />
          </el-form-item>

          <el-form-item label="分享圖規則">
            <el-radio-group
              v-model="contentTemplates[def.key].imageMode"
              :disabled="!contentTemplates[def.key].enabled"
            >
              <el-radio-button label="default">使用預設圖</el-radio-button>
              <el-radio-button label="first">取首圖</el-radio-button>
              <el-radio-button label="fixed">固定圖</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            v-if="contentTemplates[def.key].imageMode === 'fixed'"
            label="固定圖 URL"
          >
            <el-input
              v-model="contentTemplates[def.key].fixedImage"
              placeholder="https://..."
            />
          </el-form-item>

          <el-form-item label="分頁規則">
            <el-switch
              v-model="contentTemplates[def.key].noindexOnPaged"
              active-text="/page/2 noindex"
            />
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
// 說明：內容模板（文章/產品/分類/一般頁）
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useSeoStore } from "@/stores/seo";

const store = useSeoStore();
const { contentTemplates } = storeToRefs(store);
const typeDefs = store.typeDefs;

// 預設展開（可依需求調整）
const activeTypes = ref(["post", "product"]);
</script>

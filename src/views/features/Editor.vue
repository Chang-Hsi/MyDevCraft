<!-- src/views/EditorPage_IDB.vue -->
<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <el-button type="primary" @click="saveNow" :loading="saving">手動儲存</el-button>
      <el-button @click="clearAll">清空</el-button>
      <span class="text-gray-500">大小：約 {{ sizeKB }} KB（每 1 秒自動存）</span>
    </div>

    <ckeditor :editor="Editor" v-model="content" @ready="onReady" />
  </div>
</template>

<script setup>
// ===== 需要的 import =====
import { ref, watch, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { get, set, del } from "idb-keyval"; // IndexedDB 簡易封裝

// ===== CKEditor 基本設定 =====
const Editor = ClassicEditor;
const content = ref("");
const editorInstance = ref(null);
function onReady(editor) {
  editorInstance.value = editor;
}

// ===== Key 與狀態 =====
const route = useRoute();
const DB_KEY = `ckdoc:${route.fullPath}`;
const saving = ref(false);

// ===== 進頁面讀取 IndexedDB =====
onMounted(async () => {
  const cached = await get(DB_KEY);
  if (typeof cached === "string") content.value = cached;
});

// ===== 顯示用大小 =====
const sizeKB = computed(() => Math.ceil(new Blob([content.value]).size / 1024));

// ===== 自動儲存：打字停止 1 秒後存入 IndexedDB =====
let timer = null;
watch(
  content,
  (val) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      saving.value = true;
      try {
        await set(DB_KEY, val || "");
      } finally {
        saving.value = false;
      }
    }, 1000);
  },
  { flush: "post" }
);

// ===== 手動存／清空 =====
async function saveNow() {
  saving.value = true;
  try {
    await set(DB_KEY, content.value || "");
  } finally {
    saving.value = false;
  }
}
async function clearAll() {
  content.value = "";
  await del(DB_KEY);
}
</script>

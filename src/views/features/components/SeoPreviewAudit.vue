<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <!-- SERP 預覽 -->
    <el-card shadow="never" class="rounded-2xl">
      <template #header
        ><div class="font-semibold">Google 結果預覽（SERP）</div></template
      >

      <div class="space-y-3">
        <!-- 控制列 -->
        <div class="flex flex-wrap items-center gap-3">
          <el-radio-group v-model="device">
            <el-radio-button label="desktop">桌機</el-radio-button>
            <el-radio-button label="mobile">手機</el-radio-button>
          </el-radio-group>

          <el-select v-model="store.previewType" class="w-40">
            <el-option label="文章" value="post" />
            <el-option label="產品" value="product" />
            <el-option label="一般頁" value="page" />
          </el-select>

          <el-select
            v-model="store.previewId"
            class="min-w-[220px]"
            placeholder="選擇預覽內容"
          >
            <el-option
              v-for="it in store.previewItems"
              :key="it.id"
              :label="`#${it.id} ${it.title}`"
              :value="it.id"
            />
          </el-select>

          <el-button
            v-if="!store.previewItems.length"
            type="primary"
            plain
            @click="onLoadDemo"
          >
            載入示例內容
          </el-button>
        </div>

        <!-- 預覽卡 -->
        <div v-if="preview" class="rounded-xl border p-4">
          <div class="text-[#1a0dab] text-lg leading-snug">
            {{ preview.title }}
          </div>
          <div class="text-[#006621] text-xs mt-1">
            {{ preview.url }}
          </div>
          <div class="text-[#4d5156] text-sm mt-1">
            {{ preview.desc }}
            <span
              :class="preview.desc.length > 120 ? 'text-red-600' : 'text-gray-400'"
              class="ml-2"
            >
              （{{ preview.desc.length }} 字）
            </span>
          </div>
        </div>

        <el-alert
          v-else
          type="warning"
          title="目前沒有可預覽的內容"
          description="請先切換型別或按「載入示例內容」。"
          :closable="false"
          show-icon
        />
      </div>
    </el-card>

    <!-- OG / Twitter 預覽 -->
    <el-card shadow="never" class="rounded-2xl">
      <template #header
        ><div class="font-semibold">Open Graph / Twitter 預覽</div></template
      >

      <div v-if="preview" class="space-y-4">
        <div class="rounded-xl border p-3">
          <div
            class="h-40 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <img :src="preview.ogImage" alt="og" class="h-full w-full object-cover" />
          </div>
          <div class="mt-3 font-medium">{{ preview.ogTitle }}</div>
          <div class="text-sm text-gray-600">{{ preview.ogDesc }}</div>
        </div>

        <el-alert
          title="預覽會套用目前模板；單頁可再覆寫。"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <el-alert
        v-else
        type="warning"
        title="目前沒有可預覽的內容"
        description="請先切換型別或按「載入示例內容」。"
        :closable="false"
        show-icon
      />
    </el-card>

    <!-- 健康檢查 -->
    <el-card shadow="never" class="rounded-2xl lg:col-span-2">
      <template #header><div class="font-semibold">健康檢查</div></template>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="rounded-2xl border p-5">
          <div class="text-gray-500">重複 Title</div>
          <div class="my-3 text-3xl font-bold">{{ store.healthStats.dupTitle }}</div>
          <el-button size="small" @click="openHealth('dupTitle')">查看清單</el-button>
        </div>
        <div class="rounded-2xl border p-5">
          <div class="text-gray-500">缺少描述</div>
          <div class="my-3 text-3xl font-bold">{{ store.healthStats.missDesc }}</div>
          <el-button size="small" @click="openHealth('missDesc')">查看清單</el-button>
        </div>
        <div class="rounded-2xl border p-5">
          <div class="text-gray-500">Noindex 頁</div>
          <div class="my-3 text-3xl font-bold">{{ store.healthStats.noindex }}</div>
          <el-button size="small" @click="openHealth('noindex')">查看清單</el-button>
        </div>
      </div>
    </el-card>

    <!-- 清單 Dialog -->
    <el-dialog v-model="dlg.visible" :title="dlg.title" width="720px">
      <el-table :data="dlg.rows" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="type" label="型別" width="120" />
        <el-table-column prop="title" label="標題" min-width="220" />
        <el-table-column prop="url" label="URL" min-width="260" />
      </el-table>
      <template #footer>
        <el-button @click="dlg.visible = false">關閉</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useSeoStore } from "@/stores/seo";

const store = useSeoStore();

// 載入示例內容（等待計算屬性刷新後再選第一筆）
async function onLoadDemo() {
  store.seedDemoContents();
  await nextTick(); // 等待 contents -> previewItems 重新計算
  const list = store.previewItems || [];
  if (list.length) {
    store.previewId = list[0].id;
  }
}

// 預覽裝置（目前僅切樣式占位，不影響邏輯）
const device = ref("desktop");

// 預覽資料
const preview = computed(() => store.activePreviewData);

// 型別改變時，若尚未選中項目，自動選第一筆
watch(
  () => store.previewType,
  async () => {
    await nextTick();
    const list = store.previewItems || [];
    store.previewId = list.length ? list[0].id : null;
  }
);

// previewItems 有資料後，若尚未選中，也自動選第一筆（處理首次載入或載入示例後的情況）
watch(
  () => store.previewItems,
  (list) => {
    const arr = list || [];
    if (arr.length && !store.previewId) {
      store.previewId = arr[0].id;
    }
  },
  { immediate: true }
);

// 健康檢查 Dialog
import { reactive } from "vue";
const dlg = reactive({ visible: false, title: "", rows: [] });
function openHealth(kind) {
  const map = {
    dupTitle: "重複 Title 清單",
    missDesc: "缺少描述 清單",
    noindex: "Noindex 頁 清單",
  };
  dlg.title = map[kind] || "清單";
  dlg.rows = store.healthList(kind);
  dlg.visible = true;
}
</script>

<template>
  <div class="p-3">
    <el-card shadow="never" class="!border-0">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-gray-600 w-16">標題</span>
          <el-input
            v-model="query.title"
            placeholder="請輸入"
            clearable
            class="w-64"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="flex items-center">
          <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </div>
        <div class="ml-auto flex items-center">
          <el-button type="primary" :icon="Plus" @click="handleCreate">新增</el-button>
          <el-button type="danger" :icon="Delete" @click="handleBatchDelete"
            >刪除</el-button
          >
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="mt-3">
      <el-table
        :data="pagedData"
        stripe
        height="720"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column type="index" label="序號" width="80" />
        <el-table-column
          prop="title"
          label="活動名稱"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column prop="creator" label="建立者" width="140" />
        <el-table-column label="活動時間" width="240">
          <template #default="{ row }">
            {{ displayTime(row) }}
          </template>
        </el-table-column>
        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="large">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="participants" label="參與人數" width="100" />
        <el-table-column label="內容" min-width="320">
          <template #default="{ row }">
            <div
              class="overflow-hidden text-ellipsis whitespace-nowrap max-w-full"
              v-html="row.desc"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" @click="edit(row)">編輯</el-button>
            <el-button type="success" @click="view(row)">詳情</el-button>
            <el-button type="danger" @click="removeOne(row)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-3">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="sizes, prev, pager, next, jumper, ->, total"
          :total="filteredTotal"
        />
      </div>
    </el-card>
  </div>

  <!-- 詳情 Dialog：寬 50vw，內容同編輯頁 Step 3 -->
  <el-dialog
    v-model="detailVisible"
    :width="'50vw'"
    align-center
    destroy-on-close
    class="event-preview-dialog"
  >
    <template #header>
      <div class="text-xl font-bold">{{ selected?.title || "活動預覽" }}</div>
    </template>

    <div class="space-y-4">
      <div class="flex gap-4 items-start">
        <img
          v-if="selected?.cover"
          :src="selected.cover"
          class="w-56 h-36 object-cover rounded border"
          alt="cover"
        />
        <div class="flex-1">
          <h2 class="text-2xl font-bold">{{ selected?.title }}</h2>
          <p v-if="selected?.creator" class="text-gray-600">
            建立人：{{ selected.creator }}
          </p>
          <p v-if="selected?.signupDeadline" class="text-gray-600">
            報名截止：{{ selected.signupDeadline }}
          </p>
          <p v-if="selected?.startAt || selected?.endAt" class="text-gray-600">
            時間：{{ selected?.startAt }} ~ {{ selected?.endAt }}
          </p>
          <p v-if="selected?.participants !== undefined" class="text-gray-600">
            人數上限：{{ selected.participants }}
          </p>
        </div>
      </div>
      <el-divider />
      <!-- 內容：優先用 content（HTML），否則用 desc -->
      <div class="prose max-w-none" v-html="detailContent"></div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Plus, Delete } from "@element-plus/icons-vue";
import { useRouter } from "vue-router";
import { useEventsStore } from "@/stores/events";

const router = useRouter();
const events = useEventsStore();

const statusType = (s) =>
  s === "進行中" ? "success" : s === "已結束" ? "danger" : "info";
const displayTime = (row) =>
  row.startAt && row.endAt ? `${row.startAt} ~ ${row.endAt}` : row.timeRange || "";

const query = ref({ title: "" });
const pagination = ref({ currentPage: 1, pageSize: 20 });

const allData = computed(() => events.list);
const filtered = computed(() => {
  const t = query.value.title.trim().toLowerCase();
  return t
    ? allData.value.filter((r) => r.title.toLowerCase().includes(t))
    : allData.value;
});
const filteredTotal = computed(() => filtered.value.length);
const pagedData = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize;
  return filtered.value.slice(start, start + pagination.value.pageSize);
});
const handleSearch = () => {
  pagination.value.currentPage = 1;
};
const handleReset = () => {
  query.value.title = "";
  pagination.value.currentPage = 1;
};

const selection = ref([]);
function onSelectionChange(val) {
  selection.value = val;
}

function removeOne(row) {
  ElMessageBox.confirm(`確認刪除「${row.title}」？`, "提示", { type: "warning" })
    .then(() => {
      events.remove(row.id);
      ElMessage.success("已刪除");
    })
    .catch(() => {});
}

function handleBatchDelete() {
  if (!selection.value.length) {
    ElMessage.warning("請先勾選要刪除的資料");
    return;
  }
  ElMessageBox.confirm(`確認刪除選取的 ${selection.value.length} 筆資料？`, "提示", {
    type: "warning",
  })
    .then(() => {
      events.removeMany(selection.value.map((r) => r.id));
      selection.value = [];
      ElMessage.success("已刪除");
    })
    .catch(() => {});
}

function handleCreate() {
  router.push("/examples/events/new");
}
function edit(row) {
  router.push(`/examples/events/${row.id}/edit`);
}

// 詳情 Dialog 狀態
const detailVisible = ref(false);
// 被選取的活動
const selected = ref(null);

// 內容：優先 content（HTML），沒有就用 desc（轉 <br>）
const detailContent = computed(() => {
  const ev = selected.value || {};
  if (ev.content && String(ev.content).trim()) return ev.content;
  if (ev.desc) return String(ev.desc).replace(/\n/g, "<br>");
  return "";
});

// 調整：點「詳情」打開 Dialog
function view(row) {
  // 以 Pinia 內容為準，避免表格資料被裁切
  selected.value = events.byId(row.id) || row;
  detailVisible.value = true;
}
</script>

<style scoped>
/* 詳情 Dialog 內的圖片/內容不超出寬度 */
.event-preview-dialog :deep(img) {
  max-width: 100%;
  height: auto;
}
.event-preview-dialog :deep(.prose) {
  max-width: 100%;
}
</style>

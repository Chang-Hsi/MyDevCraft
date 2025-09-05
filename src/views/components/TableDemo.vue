<template>
  <div class="table-demo">
    <!-- 14) 工具列（sticky） -->
    <div class="toolbox sticky">
      <div class="left">
        <el-input v-model="q.keyword" placeholder="關鍵字" class="!w-56" clearable />
        <el-select v-model="q.category" placeholder="分類" class="!w-40" clearable>
          <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
        </el-select>
        <el-button type="primary" @click="doSearch">搜尋</el-button>
        <el-button @click="resetSearch">重置</el-button>

        <el-button :disabled="!selection.length" @click="batchOn">批次上架</el-button>
        <el-button :disabled="!selection.length" @click="batchOff">批次下架</el-button>
      </div>

      <div class="right">
        <el-button text @click="refresh"
          ><el-icon><Refresh /></el-icon>刷新</el-button
        >
        <el-button text @click="exportCSV"
          ><el-icon><Download /></el-icon>導出 CSV</el-button
        >
        <el-dropdown>
          <el-button text>
            密度：{{ densityLabel }}<el-icon class="ml-1"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="setDensity('compact')">緊湊</el-dropdown-item>
              <el-dropdown-item @click="setDensity('medium')">適中</el-dropdown-item>
              <el-dropdown-item @click="setDensity('loose')">寬鬆</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button text @click="colPicker.open = true"
          ><el-icon><Operation /></el-icon>欄位</el-button
        >
        <el-tag v-if="queryBadge" type="info" effect="plain">{{ queryBadge }}</el-tag>
      </div>
    </div>

    <!-- 5) 固定表頭 + 1/2/… 欄位 -->
    <el-table
      ref="tableRef"
      :data="pagedRows"
      row-key="id"
      :height="tableHeight"
      :size="densitySize"
      @selection-change="selection = $event"
      @sort-change="onSortChange"
      :default-sort="defaultSort"
      :summary-method="summaryMethod"
      show-summary
    >
      <!-- 2) 選取列 -->
      <el-table-column type="selection" width="56" fixed="left" />

      <!-- 2) 序號列 -->
      <el-table-column type="index" label="#" width="60" fixed="left" />

      <!-- 2/3) 縮圖列 + 彈窗 -->
      <el-table-column
        v-if="isColShown('thumb')"
        prop="images"
        label="縮圖"
        width="86"
        fixed="left"
      >
        <template #default="{ row }">
          <div
            class="thumb"
            @click="openViewer(row, 0)"
            @mouseenter="row._hover = true"
            @mouseleave="row._hover = false"
          >
            <img :src="row.images[0]" alt="" />
            <el-icon v-show="row._hover" class="zoom"><Search /></el-icon>
          </div>
        </template>
      </el-table-column>

      <!-- 2) 標題列 -->
      <el-table-column
        v-if="isColShown('title')"
        prop="title"
        label="標題"
        min-width="180"
        fixed="left"
      >
        <template #default="{ row }">
          <div class="title">
            <div class="main">{{ row.title }}</div>
            <div class="sub">
              <el-tag size="small" type="info" effect="plain">{{ row.category }}</el-tag>
              <el-tag
                v-for="t in row.tags"
                :key="t"
                size="small"
                class="ml-1"
                effect="plain"
                >{{ t }}</el-tag
              >
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 2) 價格/庫存（自訂排序）、負庫存警示 -->
      <el-table-column
        v-if="isColShown('price')"
        prop="price"
        label="價格"
        width="110"
        sortable="custom"
        align="right"
      >
        <template #default="{ row }">
          {{ formatDollar(row.price) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColShown('stock')"
        prop="stock"
        label="庫存"
        width="100"
        sortable="custom"
        align="right"
      >
        <template #default="{ row }">
          <span :class="{ danger: row.stock < 0 }">{{ row.stock }}</span>
        </template>
      </el-table-column>

      <!-- 2) 狀態 -->
      <el-table-column
        v-if="isColShown('status')"
        prop="status"
        label="狀態"
        width="120"
        align="center"
      >
        <template #default="{ row }">
          <el-switch
            :model-value="row.status === 'on'"
            active-text="上架"
            inactive-text="下架"
            inline-prompt
            @click.stop="askAndToggle(row)"
          />
        </template>
      </el-table-column>

      <!-- 2) 評分 / 進度 -->
      <el-table-column
        v-if="isColShown('rating')"
        prop="rating"
        label="評分"
        width="150"
        align="center"
      >
        <template #default="{ row }">
          <el-rate :model-value="row.rating" disabled allow-half />
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColShown('progress')"
        prop="progress"
        label="進度"
        width="160"
      >
        <template #default="{ row }">
          <el-progress :percentage="row.progress" :stroke-width="10" />
        </template>
      </el-table-column>

      <!-- 2) 擁有者 -->
      <el-table-column
        v-if="isColShown('owner')"
        prop="ownerName"
        label="擁有者"
        width="140"
      >
        <template #default="{ row }">
          <div class="owner">
            <el-avatar :src="row.ownerAvatar" size="small" class="mr-2" />
            <span>{{ row.ownerName }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 2) 時間 -->
      <el-table-column
        v-if="isColShown('createdAt')"
        prop="createdAt"
        label="建立時間"
        width="160"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ fromNow(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="isColShown('updatedAt')"
        prop="updatedAt"
        label="更新時間"
        width="160"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ fromNow(row.updatedAt) }}
        </template>
      </el-table-column>

      <!-- 7) 展開列 -->
      <el-table-column type="expand" width="50">
        <template #default="{ row }">
          <div class="expand">
            <div class="left">
              <el-carousel height="220px" indicator-position="outside">
                <el-carousel-item v-for="(img, i) in row.images" :key="i">
                  <img :src="img" class="expand-img" />
                </el-carousel-item>
              </el-carousel>
            </div>
            <div class="right">
              <el-descriptions :title="row.title" column="1" size="small" border>
                <el-descriptions-item label="分類">{{
                  row.category
                }}</el-descriptions-item>
                <el-descriptions-item label="標籤">
                  <el-tag v-for="t in row.tags" :key="t" size="small" class="mr-1">{{
                    t
                  }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="描述">{{ row.desc }}</el-descriptions-item>
              </el-descriptions>

              <div class="mt-3">
                <el-timeline>
                  <el-timeline-item
                    v-for="(log, i) in row.logs"
                    :key="i"
                    :timestamp="log.time"
                  >
                    {{ log.text }}
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 4) 操作列 -->
      <el-table-column label="操作" width="280" fixed="right" align="center">
        <template #default="{ row, $index }">
          <el-tooltip content="查看詳情" placement="top">
            <el-button text @click="viewRow(row)"
              ><el-icon><View /></el-icon
            ></el-button>
          </el-tooltip>

          <el-tooltip :content="canEdit(row) ? '編輯' : '無權編輯'" placement="top">
            <span>
              <el-button text :disabled="!canEdit(row)" @click="editRow(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
            </span>
          </el-tooltip>

          <el-tooltip content="複製連結" placement="top">
            <el-button text @click="copyLink(row)">
              <el-icon><Link /></el-icon>
            </el-button>
          </el-tooltip>

          <el-popover placement="bottom" trigger="click" width="180">
            <template #reference>
              <el-button text
                ><el-icon><MoreFilled /></el-icon
              ></el-button>
            </template>
            <div class="flex flex-col gap-2">
              <el-button size="small" @click="featureRow(row)" plain>設為精選</el-button>
              <el-button size="small" @click="duplicateRow(row)" plain
                >建立副本</el-button
              >
              <el-button size="small" @click="moveRow(row)" plain>移動到…</el-button>
            </div>
          </el-popover>

          <el-popconfirm title="確定刪除？" @confirm="removeRow(row, $index)">
            <template #reference>
              <el-button text type="danger"
                ><el-icon><Delete /></el-icon
              ></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分頁（10） -->
    <div class="mt-3 flex items-center justify-between">
      <div>共 {{ filteredRows.length }} 筆</div>
      <el-pagination
        layout="prev, pager, next, sizes"
        :page-sizes="[10, 20, 50]"
        v-model:page-size="page.size"
        v-model:current-page="page.index"
        :total="filteredRows.length"
      />
    </div>

    <!-- 3) 圖庫彈窗 / 跨列切換 -->
    <el-dialog v-model="viewer.open" width="80%" :show-close="false" destroy-on-close>
      <template #header>
        <div class="viewer-header">
          <el-button text @click="prevRow" :disabled="viewer.rowIdx <= 0">
            <el-icon><ArrowLeft /></el-icon>上一筆
          </el-button>
          <div class="grow text-center font-semibold">
            {{ rows[viewer.rowIdx]?.title }}（{{ viewer.imgIdx + 1 }}/{{
              rows[viewer.rowIdx]?.images.length || 0
            }}）
          </div>
          <el-button text @click="nextRow" :disabled="viewer.rowIdx >= rows.length - 1">
            下一筆<el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="viewer-body">
        <el-image-viewer
          v-if="viewer.open"
          :url-list="rows[viewer.rowIdx].images"
          :initial-index="viewer.imgIdx"
          hide-on-click-modal
          @close="viewer.open = false"
        />
      </div>

      <template #footer>
        <div class="viewer-tools">
          <el-button @click="copyLink({ id: rows[viewer.rowIdx].id })"
            >複製連結</el-button
          >
          <el-button @click="downloadCurrent">下載</el-button>
          <el-button type="primary" @click="viewer.open = false">關閉 (Esc)</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 9) 欄位顯示管理 -->
    <el-drawer v-model="colPicker.open" title="欄位管理" size="30%">
      <el-checkbox-group v-model="colPicker.visibleKeys" class="col-picker">
        <el-checkbox v-for="c in allColumns" :key="c.key" :label="c.key">{{
          c.label
        }}</el-checkbox>
      </el-checkbox-group>
      <div class="mt-3">
        <el-button type="primary" @click="saveColPrefs">儲存</el-button>
        <el-button @click="resetColPrefs">重設為預設</el-button>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from "vue";
import {
  Refresh,
  Download,
  ArrowDown,
  Operation,
  Search,
  View,
  Edit,
  Link,
  MoreFilled,
  Delete,
  ArrowLeft,
  ArrowRight,
} from "@element-plus/icons-vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ElMessageBox, ElMessage } from "element-plus";

import "dayjs/locale/zh-tw";
dayjs.extend(relativeTime);
dayjs.locale("zh-tw");

/** ------------------------
 * 1) 資料模型 + 假資料
 * ------------------------ */
const categories = ["電子", "服飾", "居家", "戶外", "美妝"];
const tagsPool = ["新品", "特價", "限量", "官方", "熱賣", "原廠"];

function genImg(w = 400, h = 300, seed = Math.random().toString(36).slice(2, 7)) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function genRow(i) {
  const cat = categories[Math.floor(Math.random() * categories.length)];
  const tagCount = 1 + Math.floor(Math.random() * 3);
  const imgs = Array.from({ length: 3 + Math.floor(Math.random() * 4) }, (_, k) =>
    genImg(800, 600, `${i}-${k}`)
  );
  return {
    id: `ID${String(i).padStart(4, "0")}`,
    images: imgs,
    title: `商品 / 內容標題 #${i}`,
    category: cat,
    tags: Array.from(
      { length: tagCount },
      () => tagsPool[Math.floor(Math.random() * tagsPool.length)]
    ),
    price: Math.round(Math.random() * 8000) / 10 + 100,
    stock: Math.round(Math.random() * 200) - 20,
    status: Math.random() > 0.3 ? "on" : "off",
    rating: Math.round(Math.random() * 10) / 2,
    progress: Math.round(Math.random() * 100),
    ownerName: ["Alice", "Bob", "Carol", "David"][i % 4],
    ownerAvatar: genImg(60, 60, `avatar-${i % 8}`),
    createdAt: Date.now() - Math.floor(Math.random() * 60 * 86400000),
    updatedAt: Date.now() - Math.floor(Math.random() * 20 * 86400000),
    desc: "這裡是內容敘述，支援換行與較長文字展示。",
    logs: [
      { time: dayjs().subtract(3, "day").format("YYYY/MM/DD HH:mm"), text: "建立草稿" },
      { time: dayjs().subtract(2, "day").format("YYYY/MM/DD HH:mm"), text: "審核通過" },
      { time: dayjs().subtract(1, "day").format("YYYY/MM/DD HH:mm"), text: "發布上線" },
    ],
  };
}
const rows = reactive(Array.from({ length: 88 }, (_, i) => genRow(i + 1)));

/** ------------------------
 * 6) 排序/過濾（本地 or 伺服器示意）
 * ------------------------ */
const q = reactive({ keyword: "", category: "" });
const queryBadge = computed(() => {
  const parts = [];
  if (q.keyword) parts.push(`關鍵字: ${q.keyword}`);
  if (q.category) parts.push(`分類: ${q.category}`);
  return parts.join("、");
});
const sort = reactive({ prop: "createdAt", order: "descending" }); // 伺服器排序示意
const defaultSort = { prop: "createdAt", order: "descending" };

const filteredRows = computed(() => {
  let list = rows.slice();
  if (q.keyword) list = list.filter((r) => r.title.includes(q.keyword));
  if (q.category) list = list.filter((r) => r.category === q.category);
  // 本地排序（只示例一列，實務可做多列 / shift 混合）
  if (sort.prop) {
    const dir = sort.order === "ascending" ? 1 : -1;
    list.sort((a, b) => (a[sort.prop] > b[sort.prop] ? 1 : -1) * dir);
  }
  return list;
});
function onSortChange({ prop, order }) {
  sort.prop = prop;
  sort.order = order;
}

/** 分頁（20） */
const page = reactive({ index: 1, size: 20 });
const pagedRows = computed(() => {
  const start = (page.index - 1) * page.size;
  return filteredRows.value.slice(start, start + page.size);
});

/** 5) sticky header + 密度 */
const tableRef = ref();
const tableHeight = 760;
const density = ref(localStorage.getItem("tableDemo:density") || "medium");
const densitySize = computed(() =>
  density.value === "compact" ? "small" : density.value === "loose" ? "large" : "default"
);
const densityLabel = computed(
  () => ({ compact: "緊湊", medium: "適中", loose: "寬鬆" }[density.value])
);
function setDensity(v) {
  density.value = v;
  localStorage.setItem("tableDemo:density", v);
}

/** 2) 欄位顯示管理（9） */
const allColumns = [
  { key: "thumb", label: "縮圖" },
  { key: "title", label: "標題" },
  { key: "price", label: "價格" },
  { key: "stock", label: "庫存" },
  { key: "status", label: "狀態" },
  { key: "rating", label: "評分" },
  { key: "progress", label: "進度" },
  { key: "owner", label: "擁有者" },
  { key: "createdAt", label: "建立時間" },
  { key: "updatedAt", label: "更新時間" },
];
const defaultVisibleKeys = allColumns.map((c) => c.key);
const colPicker = reactive({
  open: false,
  visibleKeys:
    JSON.parse(localStorage.getItem("tableDemo:cols") || "null") || defaultVisibleKeys,
});
const isColShown = (key) => colPicker.visibleKeys.includes(key);
function saveColPrefs() {
  localStorage.setItem("tableDemo:cols", JSON.stringify(colPicker.visibleKeys));
  colPicker.open = false;
}
function resetColPrefs() {
  colPicker.visibleKeys = defaultVisibleKeys.slice();
  saveColPrefs();
}

/** 3) 圖庫彈窗（ImageViewer） */
const viewer = reactive({ open: false, rowIdx: 0, imgIdx: 0 });
function openViewer(row, imgIdx = 0) {
  viewer.rowIdx = rows.findIndex((r) => r.id === row.id);
  viewer.imgIdx = imgIdx;
  viewer.open = true;
}
function prevRow() {
  if (viewer.rowIdx > 0) {
    viewer.rowIdx--;
    viewer.imgIdx = 0;
  }
}
function nextRow() {
  if (viewer.rowIdx < rows.length - 1) {
    viewer.rowIdx++;
    viewer.imgIdx = 0;
  }
}
function downloadCurrent() {
  const url = rows[viewer.rowIdx].images[viewer.imgIdx];
  const a = document.createElement("a");
  a.href = url;
  a.download = `${rows[viewer.rowIdx].id}-${viewer.imgIdx + 1}.jpg`;
  a.click();
}
function onKey(e) {
  if (!viewer.open) return;
  if (e.key === "ArrowLeft") prevRow();
  if (e.key === "ArrowRight") nextRow();
  if (e.key === "Escape") viewer.open = false;
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

/** 4) 操作列動作 */
function viewRow(row) {
  ElMessage.info(`查看：${row.id}`);
}
function canEdit(row) {
  return row.status === "on";
} // 權限示意
function editRow(row) {
  ElMessage.success(`編輯：${row.id}`);
}
async function copyLink(row) {
  const link = location.href + `#${row.id}`;
  await navigator.clipboard.writeText(link);
  ElMessage.success("連結已複製");
}
function featureRow(row) {
  ElMessage.success(`已設為精選：${row.id}`);
}
function duplicateRow(row) {
  const copy = JSON.parse(JSON.stringify(row));
  copy.id = `ID${String(rows.length + 1).padStart(4, "0")}`;
  copy.title += "（副本）";
  rows.unshift(copy);
  ElMessage.success("已建立副本");
}
function moveRow() {
  ElMessage.info("開啟移動對話框（示意）");
}
function removeRow(row, idx) {
  const i = rows.findIndex((r) => r.id === row.id);
  if (i >= 0) rows.splice(i, 1);
  ElMessage.success("已刪除");
}

/** 2) 狀態切換 */
function toggleStatus(row) {
  row.status = row.status === "on" ? "off" : "on";
  ElMessage.success(`已${row.status === "on" ? "上架" : "下架"}`);
}

async function askAndToggle(row) {
  const toOn = row.status !== "on";
  try {
    await ElMessageBox.confirm(`確定要將此項目${toOn ? "上架" : "下架"}？`, "Warning", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      center: false,
    });
    // 真的切
    row.status = toOn ? "on" : "off";
    ElMessage.success(`已${toOn ? "上架" : "下架"}`);
  } catch {
    // 取消 → 什麼都不做，因為這是受控元件，畫面不會自動切
  }
}

/** 14) 工具列動作 / 回復 */
const selection = ref([]);
function doSearch() {
  page.index = 1;
}
function resetSearch() {
  q.keyword = "";
  q.category = "";
  page.index = 1;
}
function refresh() {
  ElMessage.success("已刷新（demo）");
}
function batchOn() {
  selection.value.forEach((r) => (r.status = "on"));
  ElMessage.success(`已上架 ${selection.value.length} 筆`);
}
function batchOff() {
  selection.value.forEach((r) => (r.status = "off"));
  ElMessage.success(`已下架 ${selection.value.length} 筆`);
}
function batchAssign() {
  ElMessage.info("批次指派（示意）");
}

/** 10) 匯出 CSV（只匯出目前篩選結果） */
function exportCSV() {
  const cols = [
    "id",
    "title",
    "category",
    "price",
    "stock",
    "status",
    "rating",
    "progress",
    "ownerName",
    "createdAt",
    "updatedAt",
  ];
  const header = cols.join(",");
  const body = filteredRows.value
    .map((r) => cols.map((k) => formatCSV(r[k])).join(","))
    .join("\n");
  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "export.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}
const formatCSV = (v) => {
  if (v == null) return "";
  if (typeof v === "string") return `"${v.replace(/"/g, '""')}"`;
  if (typeof v === "number") return String(v);
  return `"${String(v).replace(/"/g, '""')}"`;
};

/** 5) 總結列（加總/平均） */
function summaryMethod({ columns, data }) {
  const sums = [];
  columns.forEach((col, i) => {
    if (i === 0) sums[i] = "小計";
    else if (col.property === "price") {
      const total = data.reduce((acc, cur) => acc + cur.price, 0);
      sums[i] = formatDollar(total);
    } else if (col.property === "stock") {
      const total = data.reduce((acc, cur) => acc + cur.stock, 0);
      sums[i] = total;
    } else if (col.property === "rating") {
      const avg = data.reduce((a, c) => a + c.rating, 0) / (data.length || 1);
      sums[i] = `平均 ${avg.toFixed(1)}`;
    } else sums[i] = "";
  });
  return sums;
}

/** 小工具 */
function fromNow(ts) {
  return dayjs(ts).fromNow();
}
function formatDollar(n) {
  return n.toLocaleString("zh-TW", { style: "currency", currency: "TWD" });
}
</script>

<style scoped>
/* 合計列 */
.table-demo :deep(.el-table__footer-wrapper) td {
  background-color: #fff !important;
  color: var(--el-text-color-primary);
  font-weight: 600;
  border-top: 1px solid var(--el-border-color-lighter);
}

.table-demo {
  padding-bottom: 24px;
}
.toolbox.sticky {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0 12px;
  background: var(--el-bg-color);
}
.toolbox .left,
.toolbox .right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* 縮圖格 */
.thumb {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  cursor: zoom-in;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.thumb .zoom {
  position: absolute;
  right: 2px;
  bottom: 2px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 4px;
  padding: 2px;
  display: inline-flex;
}

/* 標題 */
.title .main {
  font-weight: 600;
  line-height: 1.2;
}
.title .sub {
  margin-top: 2px;
  color: var(--el-text-color-secondary);
}

/* 擁有者 */
.owner {
  display: flex;
  align-items: center;
}
.danger {
  color: var(--el-color-danger);
}

/* 展開列 */
.expand {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 14px;
}
.expand-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 8px;
}

.viewer-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.viewer-body {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}
.viewer-tools {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.col-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>

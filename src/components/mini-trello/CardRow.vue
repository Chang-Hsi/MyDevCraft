<template>
  <div
    class="group rounded-xl border border-gray-200 bg-white px-3.5 py-3 transition hover:border-indigo-200 hover:shadow-sm cursor-grab"
  >
    <!-- 標籤（膠囊） -->
    <div v-if="labels.length" class="flex flex-wrap gap-1.5 mb-1">
      <span
        v-for="(lb, i) in labels"
        :key="i"
        class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
        :class="pillClass(i)"
      >
        {{ lb }}
      </span>
    </div>

    <!-- 標題 + 右上更多 -->
    <div class="flex items-start justify-between gap-2">
      <h4 class="text-[15px] leading-6 font-semibold text-slate-800 break-words">
        {{ card.title || "Untitled" }}
      </h4>

      <el-dropdown trigger="click" @command="onCommand">
        <el-button link class="text-slate-500 hover:text-slate-700">
          <el-icon><MoreFilled /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="edit">
              <el-icon><EditIcon /></el-icon>
              編輯
            </el-dropdown-item>
            <el-dropdown-item divided command="delete" class="!text-red-500">
              <el-icon><Delete /></el-icon>
              刪除
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 底部：圖示列 + 頭像堆疊 -->
    <div class="mt-3 flex items-center justify-between">
      <!-- 左側：日期 / 描述 / checklist / 附件 / 位置 -->
      <div class="flex items-center gap-2 text-[13px] text-slate-600">
        <!-- 到期日（色彩依狀態變化） -->
        <span
          v-if="card.dueDate"
          class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5"
          :class="dueClass"
        >
          <el-icon class="text-current"><Timer /></el-icon>
          {{ dueTextShort }}
        </span>

        <!-- Checklist -->
        <span
          v-if="card.checklist?.total"
          class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          <el-icon><Finished /></el-icon>
          {{ card.checklist.done }}/{{ card.checklist.total }}
        </span>

        <!-- 附件數 -->
        <span
          v-if="Number(card.attachments) > 0"
          class="inline-flex items-center gap-1 text-slate-500"
        >
          <el-icon><Link /></el-icon>
          {{ card.attachments }}
        </span>

        <!-- 有備註就顯示一個文檔圖示 -->
        <el-icon v-if="card.note" class="text-slate-400"><Document /></el-icon>

        <!-- 位置（有就顯示小定位圖示） -->
        <el-icon v-if="card.location" class="text-slate-400"><Location /></el-icon>
      </div>

      <!-- 右側：頭像堆疊 -->
      <div class="flex -space-x-2">
        <el-avatar
          v-for="(av, idx) in avatarList"
          :key="idx"
          :size="36"
          :src="av"
          class="ring-2 ring-white"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  MoreFilled,
  Edit as EditIcon,
  Delete,
  Timer,
  Finished,
  Document,
  Link,
  Location,
} from "@element-plus/icons-vue";

const props = defineProps({
  card: { type: Object, required: true },
  list: { type: Object, required: true },
});
const emit = defineEmits(["edit", "delete", "move"]);

/* ===== 標籤顏色（Tailwind 膠囊） ===== */
const PILL = [
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-rose-100 text-rose-700",
  "bg-violet-100 text-violet-700",
];
const pillClass = (i) => PILL[i % PILL.length];
const labels = computed(() =>
  Array.isArray(props.card.labels) ? props.card.labels : []
);

/* ===== 到期日狀態與顯示 ===== */
const dueMs = computed(() => (props.card.dueDate ? Number(props.card.dueDate) : null));
const isOverdue = computed(
  () => !!dueMs.value && dueMs.value < Date.now() - 24 * 3600 * 1000
);
const isToday = computed(() => {
  if (!dueMs.value) return false;
  const d = new Date(dueMs.value);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
});
const dueTextShort = computed(() => {
  if (!dueMs.value) return "";
  // Trello 風格：Sep 20
  return new Date(dueMs.value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
});
const dueClass = computed(() => {
  if (isOverdue.value) return "bg-red-50 text-red-700 border-red-200";
  if (isToday.value) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
});

/* ===== 頭像：支援 assignees[] 或舊欄位 assigneeAvatar ===== */
const avatarList = computed(() => {
  if (Array.isArray(props.card.assignees) && props.card.assignees.length)
    return props.card.assignees;
  return props.card.assigneeAvatar ? [props.card.assigneeAvatar] : [];
});

function onCommand(cmd) {
  if (cmd === "edit") emit("edit", props.card, props.list);
  else if (cmd === "delete") emit("delete", props.card.id);
}
</script>

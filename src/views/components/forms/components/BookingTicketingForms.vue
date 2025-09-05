<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <template #header><b>預約（示意）</b></template>
      <el-form :model="bk" label-width="90px">
        <el-form-item label="日期">
          <el-date-picker v-model="bk.date" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="時間"
          ><el-time-select v-model="bk.time" start="09:00" step="00:30" end="21:00"
        /></el-form-item>
        <el-form-item label="人數"
          ><el-input-number v-model="bk.pax" :min="1" :max="10"
        /></el-form-item>
        <el-form-item label="備註">
          <el-input
            v-model="bk.note"
            type="textarea"
            rows="2"
            placeholder="可填寫需求、過敏等"
          />
        </el-form-item>
        <el-form-item
          ><el-button type="primary" @click="submit">預約</el-button></el-form-item
        >
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header><b>行事曆（Element Plus）</b></template>

      <el-calendar v-model="calendarValue">
        <template #date-cell="{ data }">
          <div class="cal-cell" @click="onPickDate(data.day)">
            <div class="cal-cell__top">
              <span class="cal-day" :class="{ 'is-today': isTodayStr(data.day) }">
                {{ dayNumber(data.day) }}
              </span>
              <el-tag
                v-if="eventsOf(data.day).length"
                size="small"
                type="success"
                effect="plain"
              >
                {{ eventsOf(data.day).length }}
              </el-tag>
            </div>

            <ul class="cal-events">
              <li
                v-for="ev in eventsOf(data.day).slice(0, 3)"
                :key="ev.id"
                class="cal-ev"
                :title="ev.note || ''"
              >
                <span class="cal-ev__dot" />
                <span class="cal-ev__title truncate">{{ ev.note || "（未備註）" }}</span>
                <span class="cal-ev__time">{{ ev.time }}</span>
              </li>
              <li v-if="eventsOf(data.day).length > 3" class="cal-ev cal-ev--more">
                +{{ eventsOf(data.day).length - 3 }} 更多
              </li>
            </ul>
          </div>
        </template>
      </el-calendar>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

/** 表單資料 */
const bk = reactive({
  date: "",
  time: "",
  pax: 2,
  note: "",
});

/** 月曆當前顯示的月份（綁定給 <el-calendar v-model>） */
const calendarValue = ref(new Date());

/** 行事曆事件：以「日期字串」為 key 的物件 */
const eventsByDate = reactive({});

// 把 "YYYY-MM-DD" 取日數字
const dayNumber = (dayStr) => Number(dayStr.slice(-2));

// 今日判斷（字串版）
const isTodayStr = (dayStr) => dayStr === toKey(new Date());

/** 工具：把 Date 或字串統一成 YYYY-MM-DD */
function toKey(d) {
  const dt = d instanceof Date ? d : new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 點日曆 → 回填（用字串）
function onPickDate(dayStr) {
  bk.date = dayStr;
  calendarValue.value = new Date(dayStr);
}

// 事件清單（可吃字串或 Date，但我們現在傳字串）
const timeToMin = (t) => {
  const [h, m] = (t || "00:00").split(":").map(Number);
  return h * 60 + m;
};
function eventsOf(keyOrDate) {
  const key = typeof keyOrDate === "string" ? keyOrDate : toKey(keyOrDate);
  const arr = eventsByDate[key] || [];
  return [...arr].sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
}

// 今日標記（給紅色圓點用）
const isToday = (d) => toKey(d) === toKey(new Date());

/** 提交預約 → 寫進行事曆 */
function submit() {
  if (!bk.date || !bk.time) {
    ElMessage.error("請先選擇日期與時間");
    return;
  }
  const key = bk.date;
  (eventsByDate[key] || (eventsByDate[key] = [])).push({
    id: Date.now(),
    time: bk.time,
    pax: bk.pax,
    note: bk.note.trim(),
  });
  // 切到該天所在月份（視覺回饋）
  calendarValue.value = new Date(key);
  ElMessage.success("預約成功（demo）");
}
</script>

<style scoped>
/* 讓每格更高（預設 ~85px），你可自行調整數值 */
:deep(.el-calendar__body) {
  padding: 0 12px 12px;
}
:deep(.el-calendar-table .el-calendar-day) {
  height: 140px; /* 拉高 */
  padding: 8px 10px; /* 內距 */
}

/* cell 內部排版 */
.cal-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 頂部：日期 + 計數標籤 */
.cal-cell__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 日期號（今日做紅圓點） */
.cal-day {
  font-size: 12px;
  color: #909399;
}
.cal-day.is-today {
  background: #ff4d4f;
  color: #fff;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 事件清單 */
.cal-events {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 每一筆事件：左藍點 + 中間標題 + 右邊時間 */
.cal-ev {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  line-height: 1.2;
}
.cal-ev__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409eff; /* Element Plus 主色 */
  flex: none;
}
.cal-ev__title {
  flex: 1;
  color: #303133;
}
.cal-ev__time {
  color: #909399;
  font-variant-numeric: tabular-nums;
}

/* “+N 更多” 的樣式 */
.cal-ev--more {
  color: #909399;
  justify-content: flex-end;
}

/* 讓超長字不撐開 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

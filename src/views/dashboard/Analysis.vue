<template>
  <div class="space-y-4">
    <!-- 上方四個資訊卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <el-card shadow="never" class="!border !border-gray-200">
        <div class="flex items-center justify-between py-4">
          <div class="flex items-center gap-3">
            <el-icon :size="24" class="text-blue-500"><User /></el-icon>
            <div class="text-gray-500">{{ t("pages.analysis.kpis.newUsers") }}</div>
          </div>
          <div class="text-2xl font-semibold">{{ fmt(kpis.newUsers) }}</div>
        </div>
      </el-card>

      <el-card shadow="never" class="!border !border-gray-200">
        <div class="flex items-center justify-between py-4">
          <div class="flex items-center gap-3">
            <el-icon :size="24" class="text-indigo-500"><ChatDotRound /></el-icon>
            <div class="text-gray-500">{{ t("pages.analysis.kpis.unreadMessages") }}</div>
          </div>
          <div class="text-2xl font-semibold">{{ fmt(kpis.unreadMessages) }}</div>
        </div>
      </el-card>

      <el-card shadow="never" class="!border !border-gray-200">
        <div class="flex items-center justify-between py-4">
          <div class="flex items-center gap-3">
            <el-icon :size="24" class="text-rose-500"><Money /></el-icon>
            <div class="text-gray-500">{{ t("pages.analysis.kpis.revenue") }}</div>
          </div>
          <div class="text-2xl font-semibold">{{ fmt(kpis.revenue) }}</div>
        </div>
      </el-card>

      <el-card shadow="never" class="!border !border-gray-200">
        <div class="flex items-center justify-between py-4">
          <div class="flex items-center gap-3">
            <el-icon :size="24" class="text-emerald-500"><ShoppingCart /></el-icon>
            <div class="text-gray-500">{{ t("pages.analysis.kpis.orders") }}</div>
          </div>
          <div class="text-2xl font-semibold">{{ fmt(kpis.orders) }}</div>
        </div>
      </el-card>
    </div>

    <!-- 中層：左餅圖 + 右長條圖 -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <el-card shadow="never" class="!border !border-gray-200">
        <div class="text-gray-700 font-semibold mb-2">
          {{ t("pages.analysis.charts.sourceTitle") }}
        </div>
        <div ref="pieRef" class="w-full h-[320px]"></div>
      </el-card>

      <el-card shadow="never" class="!border !border-gray-200">
        <div class="text-gray-700 font-semibold mb-2">
          {{ t("pages.analysis.charts.weeklyActiveTitle") }}
        </div>
        <div ref="barRef" class="w-full h-[320px]"></div>
      </el-card>
    </div>

    <!-- 下層：折線圖 -->
    <el-card shadow="never" class="!border !border-gray-200">
      <div class="text-center text-gray-700 font-semibold mb-2">
        {{ t("pages.analysis.charts.monthlySalesTitle") }}
      </div>
      <div ref="lineRef" class="w-full h-[360px]"></div>
    </el-card>
  </div>
</template>

<script setup>
/*
  依賴：
  npm i echarts
*/
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import * as echarts from "echarts";
import { User, ChatDotRound, Money, ShoppingCart } from "@element-plus/icons-vue";

/* i18n */
const { t, locale } = useI18n();

/* ===== 靜態數據（語意化 key，不直接寫中文，方便多語 ===== */
const kpis = {
  newUsers: 102400,
  unreadMessages: 81212,
  revenue: 9280,
  orders: 13600,
};

// 餅圖資料：以 key 表示來源類型，顯示名稱交給 i18n
const sourcePieData = [
  { key: "direct", value: 335 },
  { key: "email", value: 120 },
  { key: "affiliate", value: 150 },
  { key: "video", value: 80 },
  { key: "search", value: 410 },
];

// 長條圖：一週 7 天
const weeklyActiveValues = [13000, 33000, 26000, 12000, 24000, 1500, 1000];
// 月份折線圖
const monthlySales = {
  plan: [100, 120, 160, 130, 150, 155, 160, 120, 155, 175, 120, 120],
  actual: [120, 90, 95, 150, 150, 145, 150, 200, 130, 55, 100, 120],
};

/* ===== 本地化文字（computed，語言切換即更新） ===== */
const weekLabels = computed(() => [
  t("pages.analysis.week.mon"),
  t("pages.analysis.week.tue"),
  t("pages.analysis.week.wed"),
  t("pages.analysis.week.thu"),
  t("pages.analysis.week.fri"),
  t("pages.analysis.week.sat"),
  t("pages.analysis.week.sun"),
]);

const monthLabels = computed(() => [
  t("pages.analysis.months.jan"),
  t("pages.analysis.months.feb"),
  t("pages.analysis.months.mar"),
  t("pages.analysis.months.apr"),
  t("pages.analysis.months.may"),
  t("pages.analysis.months.jun"),
  t("pages.analysis.months.jul"),
  t("pages.analysis.months.aug"),
  t("pages.analysis.months.sep"),
  t("pages.analysis.months.oct"),
  t("pages.analysis.months.nov"),
  t("pages.analysis.months.dec"),
]);

const pieLocalized = computed(() =>
  sourcePieData.map((d) => ({
    name: t(`pages.analysis.sources.${d.key}`),
    value: d.value,
  }))
);

const legendPlan = computed(() => t("pages.analysis.series.plan"));
const legendActual = computed(() => t("pages.analysis.series.actual"));

/* ===== DOM Refs & ECharts 實例 ===== */
const pieRef = ref(null);
const barRef = ref(null);
const lineRef = ref(null);

let pieChart, barChart, lineChart;

// 依當前語系做千分位
const fmt = (n) => new Intl.NumberFormat(locale.value).format(n);

/* ===== 初始化 / 更新圖表 ===== */
const renderCharts = () => {
  // Pie
  if (pieRef.value) {
    if (!pieChart) pieChart = echarts.init(pieRef.value);
    pieChart.setOption(
      {
        color: ["#1e3a8a", "#22c55e", "#f59e0b", "#ef4444", "#60a5fa"],
        tooltip: { trigger: "item" },
        legend: { orient: "vertical", left: 10, top: 10, textStyle: { color: "#666" } },
        series: [
          {
            name: t("pages.analysis.charts.sourceTitle"),
            type: "pie",
            radius: ["35%", "65%"],
            center: ["55%", "55%"],
            avoidLabelOverlap: false,
            label: { formatter: "{b}\n{d}%" },
            labelLine: { length: 12, length2: 8 },
            data: pieLocalized.value,
          },
        ],
      },
      { replaceMerge: ["series", "legend"] }
    );
  }

  // Bar
  if (barRef.value) {
    if (!barChart) barChart = echarts.init(barRef.value);
    barChart.setOption(
      {
        color: ["#5470c6"],
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: 40, right: 20, top: 30, bottom: 30 },
        xAxis: { type: "category", data: weekLabels.value, axisTick: { show: false } },
        yAxis: { type: "value", splitLine: { lineStyle: { color: "#eee" } } },
        series: [
          {
            type: "bar",
            barWidth: "50%",
            data: weeklyActiveValues,
            itemStyle: { borderRadius: [4, 4, 0, 0] },
          },
        ],
      },
      { replaceMerge: ["xAxis", "series"] }
    );
  }

  // Line
  if (lineRef.value) {
    if (!lineChart) lineChart = echarts.init(lineRef.value);
    lineChart.setOption(
      {
        color: ["#3b82f6", "#22c55e"],
        tooltip: { trigger: "axis" },
        legend: { data: [legendPlan.value, legendActual.value], top: 0 },
        grid: { left: 40, right: 20, top: 40, bottom: 30 },
        xAxis: { type: "category", data: monthLabels.value, boundaryGap: false },
        yAxis: { type: "value", splitLine: { lineStyle: { color: "#eee" } } },
        series: [
          {
            name: legendPlan.value,
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 6,
            data: monthlySales.plan,
          },
          {
            name: legendActual.value,
            type: "line",
            smooth: true,
            symbol: "circle",
            symbolSize: 6,
            data: monthlySales.actual,
          },
        ],
      },
      { replaceMerge: ["legend", "xAxis", "series"] }
    );
  }
};

const onResize = () => {
  pieChart && pieChart.resize();
  barChart && barChart.resize();
  lineChart && lineChart.resize();
};

onMounted(() => {
  renderCharts();
  window.addEventListener("resize", onResize);
});

// 語言切換時重繪（會更新所有文案）
watch(locale, () => {
  renderCharts();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  pieChart && pieChart.dispose();
  barChart && barChart.dispose();
  lineChart && lineChart.dispose();
});
</script>

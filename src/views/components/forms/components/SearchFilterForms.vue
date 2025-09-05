<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <template #header><b>快速搜尋 + 篩選條</b></template>

      <!-- 第一、二行：篩選條 -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <!-- 第 1 行 -->
        <div class="md:col-span-2">
          <el-input
            v-model="q.keyword"
            placeholder="關鍵字"
            clearable
            @keyup.enter="emitSearch"
            @input="onInputKeyword"
            class="w-full"
          />
        </div>

        <div class="md:col-span-2">
          <el-select v-model="q.category" placeholder="分類" clearable class="w-full">
            <el-option label="全部" value="" />
            <el-option label="電子" value="elec" />
            <el-option label="服飾" value="fashion" />
            <el-option label="居家" value="home" />
          </el-select>
        </div>

        <div class="md:col-span-2">
          <el-cascader
            v-model="q.region"
            :options="regions"
            clearable
            placeholder="地區"
            class="w-full"
          />
        </div>

        <!-- daterange 比較寬，給 3 欄並加 min-w-0 -->
        <div class="md:col-span-3 min-w-0">
          <el-date-picker
            v-model="q.range"
            type="daterange"
            range-separator="至"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </div>

        <!-- 這個空格子是「換行符」：把後面的內容推到第 2 行 -->
        <div class="hidden md:block md:col-span-12"></div>

        <!-- 第 2 行 -->
        <div class="md:col-span-2">
          <el-radio-group v-model="q.status" class="flex flex-wrap gap-1">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="on">上架</el-radio-button>
            <el-radio-button label="off">下架</el-radio-button>
          </el-radio-group>
        </div>

        <div class="md:col-span-2">
          <el-select v-model="q.sort" placeholder="排序" class="w-full">
            <el-option label="最新" value="new" />
            <el-option label="熱門" value="hot" />
            <el-option label="價格低→高" value="priceAsc" />
            <el-option label="價格高→低" value="priceDesc" />
          </el-select>
        </div>
      </div>

      <!-- 第 3 行：操作按鈕 -->
      <div class="mt-3 flex gap-2 flex-wrap">
        <el-button type="primary" @click="emitSearch">搜尋</el-button>
        <el-button @click="reset">重置</el-button>
        <el-button text type="primary" @click="advOpen = !advOpen">
          {{ advOpen ? "收合高級篩選" : "展開高級篩選" }}
        </el-button>
      </div>
    </el-card>

    <!-- 高級篩選 -->
    <el-card v-show="advOpen" shadow="never">
      <template #header><b>高級篩選</b></template>
      <div class="flex items-center gap-4 flex-wrap">
        <el-switch v-model="adv.freeShipping" active-text="免運" />
        <el-switch v-model="adv.inStock" active-text="現貨" />
        <el-popover trigger="click" placement="bottom-start" width="260">
          <template #reference>
            <el-button text>價格區間</el-button>
          </template>
          <div class="flex items-center gap-2">
            <el-input-number v-model="adv.priceMin" :min="0" />
            <span>~</span>
            <el-input-number v-model="adv.priceMax" :min="0" />
          </div>
        </el-popover>
        <div class="flex gap-2">
          <el-tag
            v-for="t in activeTags"
            :key="t"
            closable
            @close="removeTag(t)"
            type="info"
            class="cursor-pointer"
          >
            {{ t }}
          </el-tag>
          <el-input
            v-model="advTag"
            size="small"
            placeholder="新增標籤後 Enter"
            @keyup.enter="addTag"
            class="!w-44"
          />
        </div>
      </div>
    </el-card>

    <!-- 查詢結果 -->
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <b>查詢結果</b>
          <span class="text-gray-500 text-sm">共 {{ rows.length }} 筆</span>
        </div>
      </template>

      <el-table :data="rows" row-key="id" stripe>
        <el-table-column label="編號" align="center" width="60">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品" min-width="160" />
        <el-table-column label="分類" width="90">
          <template #default="{ row }">{{ categoryMap[row.category] || "-" }}</template>
        </el-table-column>
        <el-table-column label="地區" width="100">
          <template #default="{ row }">{{ cityLabelMap[row.city] || "-" }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="建立日期" width="120" />
        <el-table-column label="狀態" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 'on' ? 'success' : 'info'">
              {{ row.status === "on" ? "上架" : "下架" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="價格" width="100">
          <template #default="{ row }">$ {{ row.price.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="免運" width="80">
          <template #default="{ row }">
            <el-tag :type="row.freeShipping ? 'success' : 'info'">
              {{ row.freeShipping ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="現貨" width="80">
          <template #default="{ row }">
            <el-tag :type="row.inStock ? 'success' : 'info'">
              {{ row.inStock ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="標籤" min-width="160">
          <template #default="{ row }">
            <el-tag v-for="t in row.tags" :key="t" size="small" class="mr-1">{{
              t
            }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { taiwanRegions } from "@/utils/taiwan-regions.js";

/* ---------- 查詢條件 ---------- */
const q = reactive({
  keyword: "",
  category: "",
  region: [], // 例：['north','tpe']
  range: "", // 例：['2025-08-01','2025-08-31']
  status: "",
  sort: "new",
});
const regions = taiwanRegions;

const advOpen = ref(false);
const adv = reactive({
  freeShipping: false,
  inStock: true,
  priceMin: 0,
  priceMax: 0,
  tags: [],
});
const advTag = ref("");
const activeTags = computed(() => adv.tags);

/* ---------- 篩選用映射 ---------- */
const cityLabelMap = Object.fromEntries(
  taiwanRegions.flatMap((g) => g.children.map((c) => [c.value, c.label]))
);
const categoryMap = {
  elec: "電子",
  fashion: "服飾",
  home: "居家",
};

/* ---------- 假資料（示例） ---------- */
const allRows = ref([
  {
    id: 1,
    name: "iPhone 15 Pro",
    category: "elec",
    group: "north",
    city: "tpe",
    createdAt: "2025-08-05",
    status: "on",
    price: 38900,
    freeShipping: true,
    inStock: true,
    tags: ["官方", "原廠保固"],
    popularity: 98,
  },
  {
    id: 2,
    name: "AirPods Pro 2",
    category: "elec",
    group: "north",
    city: "ntp",
    createdAt: "2025-08-10",
    status: "on",
    price: 6490,
    freeShipping: true,
    inStock: true,
    tags: ["熱銷"],
    popularity: 92,
  },
  {
    id: 3,
    name: "Dyson 吸塵器 V12",
    category: "home",
    group: "central",
    city: "txg",
    createdAt: "2025-07-20",
    status: "off",
    price: 17900,
    freeShipping: false,
    inStock: true,
    tags: ["家電"],
    popularity: 70,
  },
  {
    id: 4,
    name: "UNIQLO 聯名外套",
    category: "fashion",
    group: "south",
    city: "khh",
    createdAt: "2025-08-15",
    status: "on",
    price: 1990,
    freeShipping: false,
    inStock: true,
    tags: ["聯名"],
    popularity: 85,
  },
  {
    id: 5,
    name: "H&M 襯衫",
    category: "fashion",
    group: "south",
    city: "tnn",
    createdAt: "2025-06-28",
    status: "off",
    price: 790,
    freeShipping: false,
    inStock: false,
    tags: ["特價"],
    popularity: 40,
  },
  {
    id: 6,
    name: "飛利浦 濾水壺",
    category: "home",
    group: "north",
    city: "hsc",
    createdAt: "2025-08-02",
    status: "on",
    price: 1290,
    freeShipping: true,
    inStock: true,
    tags: ["居家"],
    popularity: 55,
  },
  {
    id: 7,
    name: "小米 手環 9",
    category: "elec",
    group: "central",
    city: "mia",
    createdAt: "2025-08-18",
    status: "on",
    price: 1095,
    freeShipping: true,
    inStock: true,
    tags: ["輕巧"],
    popularity: 77,
  },
  {
    id: 8,
    name: "IKEA 書桌",
    category: "home",
    group: "east",
    city: "hul",
    createdAt: "2025-08-08",
    status: "on",
    price: 3490,
    freeShipping: false,
    inStock: true,
    tags: ["組裝"],
    popularity: 60,
  },
  {
    id: 9,
    name: "Nike 跑鞋 Pegasus",
    category: "fashion",
    group: "north",
    city: "tyn",
    createdAt: "2025-08-12",
    status: "on",
    price: 3290,
    freeShipping: true,
    inStock: true,
    tags: ["官方"],
    popularity: 88,
  },
  {
    id: 10,
    name: "三星 S24",
    category: "elec",
    group: "east",
    city: "ttt",
    createdAt: "2025-07-31",
    status: "off",
    price: 29900,
    freeShipping: true,
    inStock: false,
    tags: ["旗艦"],
    popularity: 65,
  },
  {
    id: 11,
    name: "原廠快充頭 35W",
    category: "elec",
    group: "islands",
    city: "phh",
    createdAt: "2025-08-22",
    status: "on",
    price: 790,
    freeShipping: false,
    inStock: true,
    tags: ["原廠保固"],
    popularity: 50,
  },
  {
    id: 12,
    name: "木質香氛蠟燭",
    category: "home",
    group: "north",
    city: "ila",
    createdAt: "2025-08-03",
    status: "on",
    price: 590,
    freeShipping: false,
    inStock: true,
    tags: ["療癒"],
    popularity: 45,
  },
]);

/* ---------- 過濾 + 排序 ---------- */
/* 當前顯示資料：預設顯示全部 */
const rows = ref([...allRows.value]);

/* 把原本 computed filteredRows 的邏輯搬到函式 */
function applyFilter(payload) {
  const { keyword, category, region, range, status, sort } = payload;
  const adv = payload.adv || {};
  let list = [...allRows.value];

  // 關鍵字（商品名或標籤）
  if (keyword?.trim()) {
    const kw = keyword.trim().toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(kw) ||
        (r.tags || []).some((t) => t.toLowerCase().includes(kw))
    );
  }

  // 分類
  if (category) list = list.filter((r) => r.category === category);

  // 地區（大區或城市）
  if (Array.isArray(region) && region.length) {
    if (region.length === 2) list = list.filter((r) => r.city === region[1]);
    else list = list.filter((r) => r.group === region[0]);
  }

  // 日期區間
  if (Array.isArray(range) && range.length === 2) {
    const [start, end] = range;
    list = list.filter((r) => r.createdAt >= start && r.createdAt <= end);
  }

  // 狀態
  if (status) list = list.filter((r) => r.status === status);

  // ===== 高級篩選 =====
  if (adv.freeShipping) list = list.filter((r) => r.freeShipping);
  if (adv.inStock) list = list.filter((r) => r.inStock);
  if (adv.priceMin) list = list.filter((r) => r.price >= adv.priceMin);
  if (adv.priceMax) list = list.filter((r) => r.price <= adv.priceMax);
  if (Array.isArray(adv.tags) && adv.tags.length) {
    list = list.filter((r) => adv.tags.every((t) => (r.tags || []).includes(t)));
  }

  // 排序
  if (sort === "new") list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (sort === "hot") list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  else if (sort === "priceAsc") list.sort((a, b) => a.price - b.price);
  else if (sort === "priceDesc") list.sort((a, b) => b.price - a.price);

  return list;
}

/* 送出查詢：此時才過濾 */
function emitSearch() {
  const payload = { ...q, adv: { ...adv } };
  rows.value = applyFilter(payload);
  console.log(`送出查詢（demo）：${JSON.stringify(payload)}`);
}

/* 重置：條件清空 + 還原 rows */
function reset() {
  Object.assign(q, {
    keyword: "",
    category: "",
    region: [],
    range: "",
    status: "",
    sort: "new",
  });
  Object.assign(adv, {
    freeShipping: false,
    inStock: true,
    priceMin: 0,
    priceMax: 0,
    tags: [],
  });
  rows.value = [...allRows.value]; // 還原顯示
}

/* ---------- 其餘互動 ---------- */
let inputTimer = null;
function onInputKeyword() {
  clearTimeout(inputTimer);
  inputTimer = setTimeout(() => {
    // 可做即時建議
  }, 400);
}

function addTag() {
  const v = advTag.value.trim();
  if (!v) return;
  if (!adv.tags.includes(v)) adv.tags.push(v);
  advTag.value = "";
}
function removeTag(t) {
  adv.tags = adv.tags.filter((x) => x !== t);
}
</script>

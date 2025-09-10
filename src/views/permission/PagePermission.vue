<template>
  <div class="flex min-h-full w-full flex-col gap-3 px-6 py-2 bg-gray-100 z-10">
    <div class="top flex items-center justify-between">
      <div
        class="card w-full h-[60px] px-6 bg-white rounded-lg shadow flex justify-end items-center duration-300 ease-in-out"
      >
        <div class="flex items-center">
          <el-button type="primary" @click="saveData">儲存</el-button>
          <el-button type="info" @click="cancel">取消</el-button>
        </div>
      </div>
    </div>

    <div class="flex justify-between gap-4">
      <div
        class="w-full min-h-[calc(100vh-180px)] p-6 bg-white rounded-lg shadow duration-300 ease-in-out flex flex-col gap-2"
      >
        <div v-for="(menuItem, menuIndex) in menuItems" :key="menuIndex" class="flex">
          <div class="w-[10%] font-bold pt-6 pl-4">
            <span class="text-2xl">{{ menuItem.name }}</span>
          </div>

          <div class="flex-1 space-y-4">
            <div v-for="(subItem, subIndex) in menuItem.subItems" :key="subIndex">
              <el-card class="w-full" shadow="hover">
                <div class="flex flex-col">
                  <div class="flex items-center space-x-4">
                    <el-switch
                      v-model="subItem.enabled"
                      class="perm-brand"
                      @change="onSwitchChange(subItem)"
                      :active-value="1"
                      :inactive-value="0"
                      size="large"
                    />
                    <span class="text-lg font-bold">{{ subItem.name }}</span>
                  </div>
                  <div
                    class="flex mt-2"
                    v-if="subItem.functions && subItem.functions.length"
                  >
                    <el-checkbox
                      v-for="(funcItem, funcIndex) in subItem.functions"
                      :key="funcIndex"
                      class="perm-brand"
                      :model-value="funcItem.checked === 1"
                      @update:model-value="(val) => (funcItem.checked = val ? 1 : 0)"
                      :disabled="subItem.enabled === 0"
                      size="large"
                    >
                      <span class="text-base">{{ funcItem.name }}</span>
                    </el-checkbox>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { usePermStore } from "@/stores/perm";

const permStore = usePermStore();
const router = useRouter();

/* ---- 工具 ---- */
function makeFunctions(labels) {
  return labels.map((n) => ({ name: n, checked: 0 }));
}

/* ---- 權限頁面的靜態結構（UI 用）---- */
const menuItems = reactive([
  {
    name: "首頁",
    subItems: [
      { name: "分析頁", enabled: 1 },
      { name: "工作台", enabled: 1, functions: makeFunctions(["新增卡片"]) },
    ],
  },
  {
    name: "文檔",
    subItems: [{ name: "文檔", enabled: 1 }],
  },
  {
    name: "引導",
    subItems: [{ name: "引導", enabled: 1 }],
  },
  {
    name: "組件",
    subItems: [
      { name: "表單", enabled: 1 },
      { name: "表格", enabled: 1, functions: makeFunctions(["掃尋", "刪除"]) },
      { name: "上傳", enabled: 1, functions: makeFunctions(["新增", "啟用", "刪除"]) },
    ],
  },
  {
    name: "功能",
    subItems: [
      { name: "編輯器", enabled: 1, functions: makeFunctions(["編輯"]) },
      { name: "推播", enabled: 1, functions: makeFunctions(["推播功能", "啟用"]) },
      { name: "SEO", enabled: 1, functions: makeFunctions(["新增", "編輯", "刪除"]) },
    ],
  },
  {
    name: "hooks",
    subItems: [
      { name: "useRequest", enabled: 1 },
      { name: "useForm", enabled: 1 },
    ],
  },
  {
    name: "多級菜單",
    subItems: [
      {
        name: "三級 - 1-1",
        enabled: 1,
        functions: makeFunctions(["編輯", "新增", "啟用", "刪除"]),
      },
      { name: "三級 - 1-2", enabled: 1 },
      { name: "二級 - 2", enabled: 1 },
    ],
  },
  {
    name: "綜合示例",
    subItems: [
      {
        name: "付款",
        enabled: 1,
        functions: makeFunctions(["查看付款紀錄", "確認付款"]),
      },
      { name: "編輯", enabled: 1, functions: makeFunctions(["編輯", "新增"]) },
    ],
  },
  {
    name: "錯誤頁面",
    subItems: [
      { name: "400 錯誤", enabled: 1 },
      { name: "403 禁止訪問", enabled: 1 },
      { name: "500 伺服器錯誤", enabled: 1 },
    ],
  },
  {
    name: "權限管理",
    subItems: [{ name: "頁面權限", enabled: 1, functions: makeFunctions(["編輯"]) }],
  },
]);

/* ---- 「群組/子頁名」⇄ 路徑對照表（與 store.setFromMenuItems 使用同一張）---- */
const pathMap = {
  "首頁/分析頁": "/dashboard/analysis",
  "首頁/工作台": "/dashboard/workbench",
  "文檔/文檔": "/docs",
  "引導/引導": "/guide",
  "組件/表單": "/components/form",
  "組件/表格": "/components/table",
  "組件/上傳": "/components/upload",
  "功能/編輯器": "/features/editor",
  "功能/推播": "/features/push",
  "功能/SEO": "/features/seo",
  "hooks/useRequest": "/hooks/useRequest",
  "hooks/useForm": "/hooks/useForm",
  "多級菜單/三級 - 1-1": "/multi/1-1",
  "多級菜單/三級 - 1-2": "/multi/1-2",
  "多級菜單/二級 - 2": "/multi/2",
  "綜合示例/付款": "/examples/payment",
  "綜合示例/編輯": "/examples/edit",
  "錯誤頁面/400 錯誤": "/errors/400",
  "錯誤頁面/403 禁止訪問": "/errors/403",
  "錯誤頁面/500 伺服器錯誤": "/errors/500",
  "權限管理/頁面權限": "/permission/page",
};

/* ---- 把 store 規則「套用回 UI」---- */
/* 規則說明：
   - permStore.rules[path] === false  → 關（enabled = 0）
   - 其他（true 或 undefined）       → 開（enabled = 1）
   這樣就符合「沒拿到 API 視為全開」的需求。
*/
function applyRulesFromStore() {
  const rules = permStore.rules || {};
  menuItems.forEach((group) => {
    group.subItems.forEach((si) => {
      const key = `${group.name}/${si.name}`;
      const path = pathMap[key];
      if (!path) return;
      const allowed = rules[path];
      si.enabled = allowed === false ? 0 : 1;
      if (si.enabled === 0 && Array.isArray(si.functions)) {
        si.functions.forEach((f) => (f.checked = 0));
      }
    });
  });
}

/* ---- 停用該頁時，把該頁所有動作勾選清空 ---- */
const onSwitchChange = (subItem) => {
  if (subItem.enabled === 0 && Array.isArray(subItem.functions)) {
    subItem.functions.forEach((f) => (f.checked = 0));
  }
};

/* ---- 取消 ---- */
const cancel = () => {
  router.back();
};

/* ---- 儲存：menuItems → rules → 存本地 + Firestore ---- */
const saveData = async () => {
  const rules = permStore.setFromMenuItems(menuItems);
  await permStore.save(rules);
  ElMessage.success("已儲存權限設定");
};

/* ---- 掛載後：先確保載入 store，然後把規則 apply 回畫面 ---- */
onMounted(async () => {
  if (!permStore.ready) {
    await permStore.load(); // 讀 Firestore → 失敗讀 localStorage → 否則空物件（全開）
  }
  applyRulesFromStore();
});

/* ---- 若外部（或另一分頁）更新了規則，也同步畫面 ---- */
watch(
  () => permStore.rules,
  () => applyRulesFromStore(),
  { deep: true }
);
</script>

<style scoped>
.perm-brand {
  --el-switch-on-color: #002554;
  --el-checkbox-checked-bg-color: #002554;
  --el-checkbox-checked-input-border-color: #002554;
  --el-checkbox-checked-text-color: #002554;
  --el-checkbox-input-border-color-hover: #002554;
}
</style>

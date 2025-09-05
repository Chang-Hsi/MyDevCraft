<template>
  <div class="space-y-4">
    <!-- CRUD 表單（Drawer 內） -->
    <el-card shadow="never">
      <template #header><b>CRUD 資料表單（新增/編輯）</b></template>
      <el-button type="primary" @click="drawer = true">新增資料</el-button>
      <el-drawer v-model="drawer" title="編輯資料" size="480px">
        <el-form ref="crudRef" :model="crud" :rules="crudRules" label-width="90px">
          <el-form-item label="名稱" prop="name"
            ><el-input v-model="crud.name"
          /></el-form-item>
          <el-form-item label="代碼" prop="code"
            ><el-input v-model="crud.code"
          /></el-form-item>
          <el-form-item label="狀態"><el-switch v-model="crud.enabled" /></el-form-item>
          <el-form-item label="描述"
            ><el-input v-model="crud.desc" type="textarea" :rows="3"
          /></el-form-item>
          <el-form-item
            ><el-button type="primary" @click="saveCrud">儲存</el-button></el-form-item
          >
        </el-form>
      </el-drawer>
    </el-card>

    <!-- 批量操作 -->
    <el-card shadow="never">
      <template #header><b>批量操作表單</b></template>
      <div class="grid md:grid-cols-2 gap-4">
        <el-form :model="batch" label-width="110px">
          <el-form-item label="動作">
            <el-select v-model="batch.action" multiple collapse-tags class="!w-full">
              <el-option label="上架" value="on" />
              <el-option label="下架" value="off" />
              <el-option label="調價" value="repricing" />
              <el-option label="指派" value="assign" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="batch.action.includes('repricing')" label="調整%">
            <el-input-number v-model="batch.delta" :min="-90" :max="300" />
          </el-form-item>
          <el-form-item label="批次 CSV">
            <el-upload
              action="#"
              :auto-upload="false"
              accept=".csv"
              :before-upload="beforeCsv"
            >
              <el-button>選擇 CSV</el-button>
              <template #tip
                ><div class="el-upload__tip text-xs">UTF-8, 2MB 以內</div></template
              >
            </el-upload>
          </el-form-item>
          <el-form-item
            ><el-button type="primary" @click="runBatch">執行</el-button></el-form-item
          >
        </el-form>
        <el-alert
          type="info"
          show-icon
          :closable="false"
          title="預覽"
          :description="JSON.stringify(batch)"
        />
      </div>
    </el-card>

    <!-- 設定表單 -->
    <el-card shadow="never">
      <template #header><b>設定表單（系統/商店/稅務）</b></template>
      <el-form :model="cfg" label-width="110px">
        <el-form-item label="啟用會員等級"
          ><el-switch v-model="cfg.levelOn"
        /></el-form-item>
        <el-form-item label="折扣上限%" v-if="cfg.levelOn">
          <el-input-number v-model="cfg.maxDiscount" :min="0" :max="50" />
        </el-form-item>
        <el-form-item label="稅率%"
          ><el-input-number v-model="cfg.tax" :min="0" :max="50" :step="0.5"
        /></el-form-item>
        <el-form-item label="JSON 配置">
          <el-tooltip effect="dark" content="可放白名單、佈署變數等" placement="top">
            <el-input
              v-model="cfg.json"
              type="textarea"
              :rows="4"
              placeholder='{"whitelist":["TW"]}'
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item
          ><el-button type="primary" @click="saveCfg">儲存設定</el-button></el-form-item
        >
      </el-form>
    </el-card>

    <!-- 工作流程 / 審批 -->
    <el-card shadow="never">
      <template #header><b>工作流程 / 審批</b></template>
      <el-steps :active="flow.step" finish-status="success" class="mb-3">
        <el-step title="提交" /><el-step title="審批" /><el-step title="完成" />
      </el-steps>
      <el-form ref="flowRef" :model="flow" :rules="flowRules" label-width="110px">
        <el-form-item label="審批意見" prop="opinion">
          <el-input v-model="flow.opinion" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="附件"
          ><el-upload action="#" :auto-upload="false" multiple
        /></el-form-item>
        <el-form-item label="下一步處理人" prop="next">
          <el-select v-model="flow.next" placeholder="選擇">
            <el-option label="Alice" value="alice" /><el-option label="Bob" value="bob" />
          </el-select>
        </el-form-item>
        <el-form-item label="抄送"
          ><el-select v-model="flow.cc" multiple allow-create
        /></el-form-item>
        <el-form-item
          ><el-button type="primary" @click="submitFlow">送出</el-button></el-form-item
        >
      </el-form>
    </el-card>

    <!-- 匯入 / 匯出設定 -->
    <el-card shadow="never">
      <template #header><b>資料匯入 / 匯出設定</b></template>
      <el-form :model="imex" label-width="110px">
        <el-form-item label="檔案">
          <el-upload
            action="#"
            :auto-upload="false"
            accept=".csv,.xlsx"
            :before-upload="beforeImex"
          >
            <el-button>選擇檔案</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="欄位對映">
          <el-select v-model="imex.mapping" multiple placeholder="選擇需匯入欄位">
            <el-option label="name → 名稱" value="name" />
            <el-option label="sku → 代碼" value="sku" />
            <el-option label="price → 價格" value="price" />
          </el-select>
        </el-form-item>
        <el-form-item
          ><el-button type="primary" @click="startImex">開始</el-button></el-form-item
        >
      </el-form>

      <el-table v-if="imex.errors.length" :data="imex.errors" border class="mt-2">
        <el-table-column prop="line" label="行號" width="90" />
        <el-table-column prop="error" label="錯誤原因" />
      </el-table>
      <el-alert v-else type="info" :closable="false" show-icon title="暫無錯誤" />
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";

/* CRUD */
const drawer = ref(false);
const crudRef = ref();
const crud = reactive({ name: "", code: "", enabled: true, desc: "" });
const crudRules = {
  name: [{ required: true, message: "必填", trigger: "blur" }],
  code: [
    { required: true, message: "必填", trigger: "blur" },
    {
      validator: (_, v, cb) =>
        /^[a-zA-Z0-9_-]{2,20}$/.test(v) ? cb() : cb(new Error("代碼格式不符")),
      trigger: ["blur", "change"],
    },
  ],
};
function saveCrud() {
  crudRef.value.validate(
    (ok) => ok && ((drawer.value = false), ElMessage.success("已儲存（demo）"))
  );
}

/* 批量 */
const batch = reactive({ action: [], delta: 0 });
function beforeCsv(file) {
  const ok = file.size < 2 * 1024 * 1024;
  if (!ok) ElMessage.error("CSV 不可超過 2MB");
  return ok;
}
function runBatch() {
  ElMessage.success("批量已提交（demo）");
}

/* 設定 */
const cfg = reactive({ levelOn: true, maxDiscount: 10, tax: 5, json: "" });
function saveCfg() {
  ElMessage.success("設定已儲存（demo）");
}

/* 工作流程 */
const flowRef = ref();
const flow = reactive({ step: 1, opinion: "", next: "", cc: [] });
const flowRules = {
  opinion: [{ required: true, message: "請填寫意見", trigger: "blur" }],
  next: [{ required: true, message: "請選擇", trigger: "change" }],
};
function submitFlow() {
  flowRef.value.validate((ok) => ok && ElMessage.success("已送審（demo）"));
}

/* 匯入/匯出 */
const imex = reactive({ mapping: [], errors: [] });
function beforeImex(file) {
  const ok = file.size < 5 * 1024 * 1024;
  if (!ok) ElMessage.error("檔案不可超過 5MB");
  return ok;
}
function startImex() {
  // demo：隨機產生一筆錯誤
  imex.errors = [{ line: 3, error: "價格缺失" }];
  ElMessage.warning("部分資料有誤（demo）");
}
</script>

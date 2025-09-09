<template>
  <!-- 用 v-model 綁定父層的 RecordDialogVisible -->
  <el-dialog
    v-model="dialogVisible"
    title="付款紀錄"
    :close-on-click-modal="false"
    width="1200px"
    append-to-body
  >
    <div class="mt-2">
      <el-table :data="records" :header-cell-style="headerCellStyle" style="width: 100%">
        <el-table-column prop="paymentTime" label="付款時間" min-width="160" />
        <el-table-column prop="paymentMethod" label="付款方式" min-width="200" />
        <el-table-column label="結帳金額" min-width="100" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column label="發票號碼" min-width="220">
          <template #default="{ row }">
            <div :class="row.isInvalid ? 'text-red-500' : ''">
              <span>{{ row.invoiceNumber }}</span>
              <span v-if="row.isInvalid">（已作廢）</span>
            </div>
            <div v-if="row.reissueInvoiceNumber" class="text-gray-500">
              {{ row.reissueInvoiceNumber }}（重開發票號碼）
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceMethod" label="發票開立方式" min-width="160" />
        <el-table-column label="付款說明" min-width="220">
          <template #default="{ row }">
            <div>{{ row.description || "—" }}</div>
            <div class="text-xs text-gray-400">
              {{ row.descriptionTime || "" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="門市名稱" min-width="120" />
        <el-table-column prop="cashier" label="門市人員" min-width="120" />
      </el-table>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed } from "vue";

/* 父層用 v-model 綁定 RecordDialogVisible；records 傳入列表資料 */
const props = defineProps({
  modelValue: { type: Boolean, default: false }, // v-model 對應
  records: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:modelValue"]);

/* 內部別名，避免用 visible 字樣 */
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

/* 表頭底色使用 bg-blue-50 (#eff6ff) */
const headerCellStyle = { backgroundColor: "#eff6ff" };

/* 金額格式：$ 整數 */
function formatCurrency(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}
</script>

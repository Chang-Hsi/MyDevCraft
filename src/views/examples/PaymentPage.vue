<template>
  <div class="flex h-full w-full bg-white">
    <!-- 左邊 -->
    <div class="flex w-9/12 flex-col justify-between bg-borderLighter">
      <div class="top flex h-full gap-1">
        <div class="left flex h-full w-[58%] gap-1">
          <!-- 本次收件（靜態資料；僅保留樣式與顯示） -->
          <div class="flex w-1/2 flex-col justify-between bg-white">
            <span>
              <div
                class="title h-14 px-2 py-3 text-xl font-bold text-textPrimary border-b border-r border-gray-300 bg-gray-50"
              >
                本次收件
              </div>
              <div
                class="h-[calc(100vh-248px)] overflow-x-auto duration-300 ease-in-out border-r border-gray-300"
              >
                <el-table
                  :height="tableHeight"
                  :data="checkoutInfo.getList"
                  :header-cell-style="headerCellStyle"
                >
                  <el-table-column label="#" align="center" width="68">
                    <template #default="scope">
                      {{ scope.$index + 1 }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="sortNumber" label="整理號" min-width="130">
                    <template #default="scope">
                      {{ scope.row.sortNumber }}
                      <br />
                      {{ scope.row.componentsNumber }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="item" label="衣物" min-width="75" />
                  <el-table-column prop="amount" label="價格" width="75">
                    <template #default="scope">
                      {{ formatCurrency(scope.row.amount) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="color" label="顏色" min-width="60" />
                </el-table>
              </div>
            </span>

            <div
              class="flex h-14 items-center justify-between bg-bgActive px-4 bg-blue-50 border-r border-gray-300"
            >
              <div class="count text-xl font-bold text-textHighlight">
                本次收件({{ checkoutInfo.getList.length }})
              </div>
              <div class="total">
                <span class="text-xl font-bold">
                  {{
                    formatCurrency(
                      checkoutInfo.getList.reduce((acc, cur) => acc + cur.amount, 0)
                    )
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- 本次取件（靜態資料；僅保留樣式與顯示） -->
          <div class="flex w-1/2 flex-col bg-white">
            <span>
              <div
                class="title h-14 px-2 py-3 text-xl font-bold text-textPrimary border-b border-r border-gray-300 bg-gray-50"
              >
                本次取件
              </div>
              <div
                class="h-[calc(100vh-193px)] overflow-x-auto duration-300 ease-in-out border-r border-gray-300"
              >
                <el-table
                  :height="tableHeight2"
                  :data="checkoutInfo.takeList"
                  :header-cell-style="headerCellStyle"
                >
                  <el-table-column label="#" align="center" width="68">
                    <template #default="scope">
                      {{ scope.$index + 1 }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="sortNumber" label="整理號" min-width="130">
                    <template #default="scope">
                      {{ scope.row.sortNumber }}
                      <br />
                      {{ scope.row.componentsNumber }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="item" label="衣物" min-width="75" />
                  <el-table-column prop="amount" label="價格" width="75">
                    <template #default="scope">
                      {{ formatCurrency(scope.row.amount) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="color" label="顏色" min-width="60" />
                </el-table>
              </div>
            </span>
          </div>
        </div>

        <!-- 右側結帳付款（保留互動 → 彈窗；其餘為靜態顯示） -->
        <div class="right w-[42%] bg-white">
          <div class="flex h-full flex-col justify-between bg-white">
            <div class="top">
              <div
                class="title h-14 px-2 py-3 text-xl font-bold text-textPrimary border-b border-r border-gray-300 bg-gray-50"
              >
                結帳付款
              </div>

              <!-- 支付方式（保留點擊→新增付款彈窗） -->
              <div class="payMethod flex flex-col gap-3 px-3">
                <div class="title font-medium text-textPrimary pt-3">支付方式</div>
                <div class="grid grid-cols-4 gap-2">
                  <div
                    :class="
                      selectedPaymentMethod.some((i) => i.id === item.id)
                        ? 'bg-blue-50' /* 調整：選中底色 */
                        : 'bg-[#F0F2F6]'
                    "
                    class="payMethodItem flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded"
                    v-for="item in paymentMethod"
                    :key="item.id"
                    @click="togglePaymentMethod(item)"
                  >
                    <img :src="item.icon || cash" :alt="item.name" />
                    <span class="text-[17px] font-medium text-actionPrimary">
                      {{ item.name }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 發票開立方式（僅顯示/選擇；不做任何後端） -->
              <div v-if="showInvoice" class="invoice mt-6 flex flex-col gap-3 px-3">
                <div class="title font-medium text-textPrimary">發票開立方式</div>
                <div class="grid grid-cols-5 gap-2">
                  <div
                    :class="
                      selectedInvoiceId === item.id
                        ? 'bg-blue-50' /* 調整：選中底色 */
                        : 'bg-[#F0F2F6]'
                    "
                    class="invoiceItem flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded"
                    v-for="item in invoiceMethod"
                    :key="item.id"
                    @click="selectedInvoiceId = item.id"
                  >
                    <img :src="item.icon" :alt="item.name" />
                    <span class="text-[17px] font-medium text-actionPrimary">
                      {{ item.name }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- 發票輸入框（純視覺；資料不送出） -->
              <div class="mt-3 w-full px-3" v-if="showInvoice">
                <el-input
                  v-if="selectedInvoiceId === 1"
                  style="height: 48px"
                  v-model="mobileInvoiceInput"
                  placeholder="請輸入手機載具"
                />
                <el-input
                  v-if="selectedInvoiceId === 6"
                  style="height: 48px"
                  v-model="unifiedNumberInput"
                  placeholder="請輸入統一編號"
                />
                <el-autocomplete
                  class="autocomplete donationInput h-12"
                  v-if="selectedInvoiceId === 5"
                  v-model="donationInvoiceInput"
                  :fetch-suggestions="querySearch"
                  clearable
                  placeholder="請輸入捐贈單位"
                  @select="onSelectDonation"
                />
                <el-input
                  v-if="selectedInvoiceId === 2"
                  style="height: 48px"
                  v-model="memberInvoiceInput"
                  placeholder="請輸入會員載具(email)"
                />
              </div>
            </div>

            <div class="bottom">
              <div
                class="flex h-14 items-center justify-between border-t border-gray-300 bg-bgActive px-4"
              >
                <div class="count text-xl text-textPrimary">未付總額</div>
                <div class="total">
                  <span class="text-xl font-bold text-systemError">
                    -{{ formatCurrency(unpaidTotal) }}
                  </span>
                </div>
              </div>

              <!-- 已選支付方式（僅輸入金額；不送出） -->
              <div v-if="selectedPaymentMethod.length > 0">
                <div
                  v-for="item in selectedPaymentMethod"
                  :key="item.id"
                  class="flex h-14 items-center justify-between border-t border-gray-300 bg-bgActive px-4"
                >
                  <div class="store text-xl text-textPrimary">{{ item.name }}</div>
                  <div class="flex items-center gap-[6px]">
                    <span class="w-[354px]">
                      <el-input
                        type="number"
                        min="0"
                        style="height: 48px"
                        v-model="item.amount"
                        placeholder="請輸入支付金額"
                        @keydown="
                          ['-', '+', 'e', 'E', '.'].includes($event.key) &&
                            $event.preventDefault()
                        "
                      />
                    </span>
                    <button
                      class="btn btn-outline btn-sm h-12 rounded border-actionPrimary bg-white text-actionPrimary hover:text-white"
                    >
                      <span
                        class="font-medium min-w-[100px]"
                        @click="fillUnpaidAmountForMethod(item)"
                      >
                        支付全部
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 餘額（純計算顯示） -->
              <div
                class="flex h-14 items-center justify-between border-t border-gray-300 bg-bgActive px-4"
              >
                <div class="count text-[34px] font-medium text-textPrimary">餘額</div>
                <div class="total">
                  <span class="text-[34px] font-medium text-systemError">
                    {{ formatCurrency(balanceAmount) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作列（改為 Demo 回饋，不做實際導頁） -->
      <div
        class="flex h-[52px] w-full gap-[4px] bg-[#A8ABB2] p-[2px] font-medium text-[#002554]"
      >
        <div
          @click="toastDemo('返回收件')"
          class="flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-white"
        >
          返回收件
        </div>
        <div
          @click="toastDemo('返回取件')"
          class="flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-white"
        >
          返回取件
        </div>
        <div
          @click="openPaymentRecord"
          class="flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-white"
        >
          查看付款紀錄
        </div>
        <div
          @click="onClickConfirmPay"
          class="flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-[#002554] text-white"
        >
          確認付款
        </div>
      </div>
    </div>

    <!-- 右邊（替代 RightSide：純靜態占位，避免觸發功能） -->
    <div class="h-full w-3/12">
      <div class="h-full w-full bg-white border-l border-solid border-border p-3">
        <div class="h-14 flex items-center text-xl font-bold text-textPrimary">
          衣物資訊
        </div>
        <div class="space-y-2 text-sm text-textSecondary">
          <div>會員：王小明</div>
          <div>電話：0912-345-678</div>
          <div>門市：瑞安門市</div>
          <div class="pt-2 text-textPrimary font-medium">備註</div>
          <div class="text-xs text-[#909399]">此區為樣式展示（Demo），無實際功能。</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 新增付款彈窗（保留） -->
  <el-dialog v-model="addingModal" :show-close="false" width="400" align-center>
    <template #header="{ close, titleId }">
      <div class="my-header flex items-center justify-between">
        <h3 :id="titleId" class="text-2xl font-medium text-textPrimary">
          {{ selectedItem.name }}支付金額
        </h3>
        <button class="btn btn-circle btn-ghost btn-sm" @click="close">✕</button>
      </div>
    </template>
    <div class="mb-2 mt-5 flex w-full flex-col gap-6">
      <div class="flex h-10 items-center justify-between gap-3">
        <span class="w-[428px]">
          <el-input
            type="number"
            min="0"
            v-model="paymentAmount"
            size="large"
            style="--el-input-height: 48px"
            placeholder="請輸入支付金額"
            @keydown="
              ['-', '+', 'e', 'E', '.'].includes($event.key) && $event.preventDefault()
            "
          />
        </span>
        <el-button
          style="padding: 22px 14px; background-color: #002554; color: white"
          @click="setRemainingUnpaidAmount()"
        >
          支付全部
        </el-button>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer flex items-center justify-end gap-2">
        <button class="btn btn-outline w-20" @click="cancleSelectedPaymentMethod()">
          取消
        </button>
        <button
          class="btn- btn btn-neutral w-20"
          @click="addToSelectedPaymentMethod(selectedItem)"
        >
          確定
        </button>
      </div>
    </template>
  </el-dialog>

  <!-- 付款紀錄彈窗（保留；使用靜態資料） -->
  <el-dialog v-model="paymentRecordModal" :show-close="false" width="1200" align-center>
    <template #header="{ close, titleId }">
      <div class="my-header flex items-center justify-between">
        <h3 :id="titleId" class="text-2xl font-medium text-textPrimary">查看付款紀錄</h3>
        <button class="btn btn-circle btn-ghost btn-sm" @click="close">✕</button>
      </div>
    </template>
    <div class="mt-5">
      <el-table :data="paymentRecordList">
        <el-table-column prop="paymentTime" label="付款時間" min-width="160" />
        <el-table-column prop="paymentMethod" label="付款方式" min-width="168" />
        <el-table-column align="right" prop="amount" label="結帳金額" min-width="90">
          <template #default="scope">
            {{ formatCurrency(scope.row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="invoiceNumber" label="發票號碼" min-width="168">
          <template #default="scope">
            <div :class="scope.row.isInvalid ? 'text-systemError' : ''">
              {{ scope.row.invoiceNumber }}
              <br />
              {{ scope.row.isInvalid ? "(已作廢)" : "" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="invoiceMethod" label="發票開立方式" min-width="168" />
        <el-table-column prop="description" label="付款說明" min-width="168">
          <template #default="scope">
            {{ scope.row.description || "一" }}
            <div class="text-xs text-[#909399]">
              {{ scope.row.descriptionTime }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="門市名稱" min-width="120" />
        <el-table-column prop="cashier" label="門市人員" min-width="120" />
      </el-table>
    </div>
  </el-dialog>

  <!-- 簡易錯誤提示（保留；給 Demo 驗證使用） -->
  <ErrorDialog v-model="errorDialogVisible" :errorMessage="errorDialogMessage" />

  <!-- LINE PAY 條碼輸入彈窗（保留） -->
  <el-dialog
    v-model="linePayDialog"
    title="掃描輸入 LINE Pay"
    width="400px"
    align-center
    @closed="onClose"
  >
    <div class="px-1 py-6">
      <el-input
        v-model="linePayCode"
        placeholder="請掃描或輸入付款條碼"
        style="width: 100%; height: 48px"
      />
    </div>
    <template #footer>
      <div class="dialog-footer flex justify-end gap-2">
        <button class="btn btn-outline w-20" @click="linePayDialog = false">取消</button>
        <button
          class="btn- btn btn-neutral w-20"
          :disabled="!linePayCode.trim()"
          @click="confirmLinePayCode"
        >
          確定
        </button>
      </div>
    </template>
  </el-dialog>

  <RecordDialog v-model="RecordDialogVisible" :records="paymentRecordList" />
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
const headerCellStyle = { backgroundColor: "#eff6ff" };
import RecordDialog from "@/components/paycheck/RecordDialog.vue";
import storeMoney from "@/assets/svg/storeMoney.svg";
import cash from "@/assets/svg/cash.svg";
import LINEPay from "@/assets/svg/LINEPay.svg";
import paperInvoice from "@/assets/svg/paperInvoice.svg";
import creditCard from "@/assets/svg/CreditCard.svg";
import mobileInvoice from "@/assets/svg/mobileInvoice.svg";
import unifiedNumber from "@/assets/svg/unifiedNumber.svg";
import donationInvoice from "@/assets/svg/donationInvoice.svg";
import memberInvoice from "@/assets/svg/memberInvoice.svg";
import ErrorDialog from "@/components/dialog/ErrorDialog.vue";

onMounted(loadDonateCodes);

/* ====== 靜態資料區 ====== */
const checkoutInfo = ref({
  takeList: [
    {
      id: 1,
      sortNumber: "R1002406001",
      componentsNumber: "",
      item: "襯衫",
      amount: 100,
      color: "黑, 藍",
    },
    {
      id: 2,
      sortNumber: "R1002400002",
      componentsNumber: "",
      item: "外套",
      amount: 250,
      color: "灰",
    },
  ],
  getList: [
    {
      id: 1,
      sortNumber: "R1002407031",
      componentsNumber: "",
      item: "西裝褲",
      amount: 180,
      color: "黑",
    },
    {
      id: 2,
      sortNumber: "R1002400032",
      componentsNumber: "",
      item: "T-Shirt",
      amount: 120,
      color: "白",
    },
  ],
  debtAmount: -300, // Demo：未付 300
});

const paymentRecordList = ref([
  {
    id: 1,
    paymentTime: "2024/06/01 12:00:00",
    paymentMethod: "現金",
    amount: 100,
    invoiceNumber: "YZ65432110",
    isInvalid: false,
    reissueInvoiceNumber: "",
    invoiceMethod: "紙本發票",
    description: "現金付款",
    descriptionTime: "2024/06/01 12:00:00",
    storeName: "瑞安門市",
    cashier: "River Hong",
  },
  {
    id: 2,
    paymentTime: "2024/06/03 15:12:21",
    paymentMethod: "信用卡",
    amount: 420,
    invoiceNumber: "AB12345678",
    isInvalid: true,
    reissueInvoiceNumber: "",
    invoiceMethod: "統一編號",
    description: "客戶要求作廢",
    descriptionTime: "2024/06/03 16:05:10",
    storeName: "瑞安門市",
    cashier: "May",
  },
]);

/* 捐贈發票清單（靜態） */
const donationInvoiceList = ref([
  { id: 560, value: "560 財團法人嘉義市私立嘉愛啓智發展中心" },
  { id: 535, value: "535 財團法人台灣動物保護協會" },
  { id: 777, value: "777 財團法人偏鄉教育基金會" },
]);

/* 會員儲值金（靜態 Demo） */
const storedValue = ref(1000);

/* 支付方式（靜態） */
const iconMapping = {
  儲值金: storeMoney,
  現金: cash,
  信用卡: creditCard,
  "LINE PAY": LINEPay,
};
const paymentMethod = ref([
  { id: 1, name: "儲值金", icon: iconMapping["儲值金"], isInvoice: false },
  { id: 2, name: "現金", icon: iconMapping["現金"], isInvoice: true },
  { id: 3, name: "信用卡", icon: iconMapping["信用卡"], isInvoice: true },
  { id: 4, name: "LINE PAY", icon: iconMapping["LINE PAY"], isInvoice: true },
]);

/* 發票方式（靜態） */
const invoiceMethod = ref([
  { id: 1, name: "手機載具", icon: mobileInvoice, isChecked: false },
  { id: 2, name: "會員載具", icon: memberInvoice, isChecked: false },
  { id: 6, name: "統一編號", icon: unifiedNumber, isChecked: false },
  { id: 4, name: "紙本發票", icon: paperInvoice, isChecked: false },
  { id: 5, name: "捐贈發票", icon: donationInvoice, isChecked: false },
]);

/* 受捐贈機關或團體捐贈碼清單（官方 Open Data API）
   說明頁見：開放資料 Open API + 資料集 31868
   常見參數：limit（最多 10000）
*/
const EINVOICE_OD_API = "/.netlify/functions/donate-codes";

async function loadDonateCodes() {
  try {
    const res = await fetch(`${EINVOICE_OD_API}?limit=10000`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // 官方回傳欄位名稱以實際文件為準；這裡做兼容處理
    const rows = json?.data || json?.rows || json || [];
    donationInvoiceList.value = rows
      .map(normalizeDonateRow)
      .filter((v) => v.id && v.value);
  } catch (err) {
    console.error("載入捐贈碼失敗：", err);
    // 可以退回你原本的靜態清單，避免畫面空白
    donationInvoiceList.value = [
      { id: 560, value: "560 財團法人嘉義市私立嘉愛啓智發展中心" },
      { id: 535, value: "535 財團法人台灣動物保護協會" },
      { id: 777, value: "777 財團法人偏鄉教育基金會" },
    ];
  }
}

// 兼容不同欄位命名（CSV/JSON 轉出可能大小寫/中文欄位不同）
function normalizeDonateRow(row) {
  const code = row.donateCode || row.DONATE_CODE || row["捐贈碼"] || row.code || row.Code;

  const name =
    row.donateNm || row.DONATE_NM || row["受捐贈機關或團體名稱"] || row.name || row.Name;

  return {
    id: String(code || "").trim(),
    value: `${String(code || "").trim()} ${String(name || "").trim()}`,
  };
}

/* ====== 欄位與狀態 ====== */
const addingModal = ref(false);
const selectedItem = ref({});
const selectedPaymentMethod = ref([]);
const selectedInvoiceId = ref(1); // 預設手機載具
const paymentAmount = ref("");
const paymentRecordModal = ref(false);
const errorDialogVisible = ref(false);
const errorDialogMessage = ref("");

/* 發票輸入框（純視覺） */
const mobileInvoiceInput = ref("");
const unifiedNumberInput = ref("");
const donationInvoiceInput = ref("");
const memberInvoiceInput = ref("");
const selectedDonation = ref(null);

/* LINE PAY 條碼（僅彈窗） */
const linePayDialog = ref(false);
const linePayCode = ref("");

/* ====== 工具與計算 ====== */
function formatCurrency(value) {
  const n = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

const tableHeight = computed(() =>
  typeof window !== "undefined" ? window.innerHeight - 248 : 600
);
const tableHeight2 = computed(() =>
  typeof window !== "undefined" ? window.innerHeight - 193 : 655
);

const paidAmount = computed(() => {
  if (selectedPaymentMethod.value.length === 0) return 0;
  return selectedPaymentMethod.value.reduce(
    (acc, cur) => acc + parseInt(cur.amount || 0),
    0
  );
});
const unpaidTotal = computed(() => Math.abs(checkoutInfo.value.debtAmount));
const balanceAmount = computed(() => -(unpaidTotal.value - paidAmount.value));

const EXCLUSIVE_PAYMENT_NAMES = ["信用卡", "LINE PAY"];
const isExclusivePayment = (name) => EXCLUSIVE_PAYMENT_NAMES.includes(name);
const hasExclusivePayment = (methods) => methods.some((m) => isExclusivePayment(m.name));
const showInvoice = computed(() =>
  selectedPaymentMethod.value.length > 0
    ? selectedPaymentMethod.value.some((i) => i.isInvoice)
    : false
);

/* ====== 互動（僅保留彈窗/提示） ====== */
const RecordDialogVisible = ref(false);
function openPaymentRecord() {
  RecordDialogVisible.value = true;
}

function querySearch(queryString, cb) {
  const results = queryString
    ? donationInvoiceList.value.filter((d) =>
        d.value.toLowerCase().includes(queryString.toLowerCase())
      )
    : donationInvoiceList.value;
  cb(results);
}
function onSelectDonation(donation) {
  selectedDonation.value = donation;
  donationInvoiceInput.value = donation.value;
}

function setRemainingUnpaidAmount() {
  const remainingUnpaid = Math.max(0, unpaidTotal.value - paidAmount.value);
  paymentAmount.value = remainingUnpaid;
}

function fillUnpaidAmountForMethod(pm) {
  const totalPaidOther = selectedPaymentMethod.value.reduce(
    (acc, cur) => (cur.id !== pm.id ? acc + parseInt(cur.amount || 0) : acc),
    0
  );
  const remainingUnpaid = Math.max(0, unpaidTotal.value - totalPaidOther);
  pm.amount = remainingUnpaid;
}

function togglePaymentMethod(item) {
  // Demo：儲值金為 0 時顯示提示（保持原 UX）
  if (item.name === "儲值金" && storedValue.value === 0) {
    ElMessage.error("儲值金不足, 請先進行儲值");
    return;
  }
  // 已選擇 → 取消
  if (selectedPaymentMethod.value.some((i) => i.id === item.id)) {
    removeFromSelectedPaymentMethod(item);
    return;
  }
  // 最多兩種
  if (selectedPaymentMethod.value.length >= 2) {
    ElMessage({ message: "最多只能選擇兩種支付方式", type: "warning", offset: 80 });
    return;
  }
  // 信用卡與 LINE PAY 互斥
  if (isExclusivePayment(item.name) && hasExclusivePayment(selectedPaymentMethod.value)) {
    ElMessage({ message: "信用卡和LINE PAY只能選一個", type: "warning", offset: 80 });
    return;
  }

  selectedItem.value = item;
  addingModal.value = true; // 僅開啟彈窗
}

function addToSelectedPaymentMethod(item) {
  // Demo：簡單檢查（不連 API）
  if (item.name === "儲值金") {
    const amount = Number(paymentAmount.value || 0);
    if (amount > storedValue.value) {
      ElMessage.error("儲值金不足, 請先進行儲值");
      return;
    }
  }
  selectedPaymentMethod.value.push({ ...item, amount: paymentAmount.value });
  addingModal.value = false;
  paymentAmount.value = null;
}
function cancleSelectedPaymentMethod() {
  addingModal.value = false;
  paymentAmount.value = null;
}
function removeFromSelectedPaymentMethod(item) {
  selectedPaymentMethod.value = selectedPaymentMethod.value.filter(
    (i) => i.id !== item.id
  );
  if (selectedPaymentMethod.value.length === 0) selectedInvoiceId.value = 1;
}

function toastDemo(label) {
  ElMessage({
    message: `${label}（Demo 模式：不進行實際操作）`,
    type: "info",
    offset: 80,
  });
}

/* 統編驗證（沿用；用於 Demo 檢查） */
function validateUnifiedNumber(number) {
  if (!/^\d{8}$/.test(number)) return false;
  const weights = [1, 2, 1, 2, 1, 2, 4, 1];
  const digits = number.split("").map(Number);
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    const product = digits[i] * weights[i];
    sum += Math.floor(product / 10) + (product % 10);
  }
  return sum % 5 === 0 || (digits[6] === 7 && (sum + 1) % 5 === 0);
}

function resetPaymentAndInvoiceData() {
  selectedPaymentMethod.value = [];
  paymentMethod.value.forEach((m) => (m.amount = null));
  selectedInvoiceId.value = 1;
  mobileInvoiceInput.value = "";
  unifiedNumberInput.value = "";
  donationInvoiceInput.value = "";
  selectedDonation.value = null;
  memberInvoiceInput.value = "";
  paymentAmount.value = null;
}

/* 確認付款（Demo：只做前端驗證與成功提示） */
function onClickConfirmPay() {
  const hasLinePay = selectedPaymentMethod.value.some((m) => m.name === "LINE PAY");
  if (hasLinePay && !linePayCode.value) {
    linePayDialog.value = true; // 先輸入條碼
  } else {
    confirmPayDemo();
  }
}
function confirmLinePayCode() {
  linePayDialog.value = false;
  confirmPayDemo();
}
function confirmPayDemo() {
  // Demo 前端檢查
  if (selectedPaymentMethod.value.length === 0) {
    errorDialogMessage.value = "請選擇至少一種支付方式";
    errorDialogVisible.value = true;
    return;
  }
  if (selectedPaymentMethod.value.some((m) => parseInt(m.amount || 0) <= 0)) {
    errorDialogMessage.value = "付款金額不可小於或等於 0";
    errorDialogVisible.value = true;
    return;
  }

  const requiresInvoice = selectedPaymentMethod.value.some((m) => m.isInvoice);
  if (requiresInvoice) {
    if (selectedInvoiceId.value === 2) {
      const email = memberInvoiceInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errorDialogMessage.value = "會員載具格式錯誤，請輸入有效的 Email";
        errorDialogVisible.value = true;
        return;
      }
    }
    if (
      selectedInvoiceId.value === 6 &&
      !validateUnifiedNumber(unifiedNumberInput.value)
    ) {
      errorDialogMessage.value = "統一編號格式不正確";
      errorDialogVisible.value = true;
      return;
    }
    if (![4].includes(selectedInvoiceId.value)) {
      // 非紙本需輸入載具
      const hasBarcode =
        (selectedInvoiceId.value === 1 && mobileInvoiceInput.value) ||
        (selectedInvoiceId.value === 2 && memberInvoiceInput.value) ||
        (selectedInvoiceId.value === 5 && selectedDonation.value?.id) ||
        (selectedInvoiceId.value === 6 && unifiedNumberInput.value);
      if (!hasBarcode) {
        errorDialogMessage.value = "請填寫正確的發票資訊";
        errorDialogVisible.value = true;
        return;
      }
    }
  }

  // 成功提示（僅 UI）
  ElMessage({
    message: "付款成功（Demo 模式，不進行實際請求）",
    type: "success",
    offset: 80,
    duration: 2000,
  });
  resetPaymentAndInvoiceData();
  linePayCode.value = "";
}

/* 關閉 LINE Pay 彈窗時清空條碼（維持 UI 一致） */
function onClose() {
  linePayCode.value = "";
}
</script>

<template>
  <div class="space-y-4">
    <!-- 匯款 / 轉帳 -->
    <el-card shadow="never">
      <template #header><b>匯款 / 轉帳</b></template>
      <el-form ref="txRef" :model="tx" :rules="txRules" label-width="110px">
        <el-form-item label="收款人" prop="payee"
          ><el-input v-model="tx.payee"
        /></el-form-item>
        <el-form-item label="銀行" prop="bank"
          ><el-select v-model="tx.bank"
            ><el-option label="001 台銀" value="001" /><el-option
              label="812 台新"
              value="812" /></el-select
        ></el-form-item>
        <el-form-item label="帳號" prop="account"
          ><el-input v-model="tx.account" maxlength="16"
        /></el-form-item>
        <el-form-item label="金額" prop="amount"
          ><el-input-number v-model="tx.amount" :min="1" :max="1000000"
        /></el-form-item>
        <el-form-item label="用途"
          ><el-select v-model="tx.purpose"
            ><el-option label="生活費" value="living" /><el-option
              label="貨款"
              value="goods" /></el-select
        ></el-form-item>
        <el-form-item label="OTP" prop="otp"
          ><el-input v-model="tx.otp" maxlength="6"
        /></el-form-item>
        <el-form-item
          ><el-alert
            type="warning"
            :closable="false"
            show-icon
            title="將進行風險檢查（黑名單/限額/2FA）"
        /></el-form-item>
        <el-form-item
          ><el-button type="primary" @click="submitTx">送出轉帳</el-button></el-form-item
        >
      </el-form>
    </el-card>

    <!-- 貸款 / 保險投保（多步） -->
    <el-card shadow="never">
      <template #header><b>貸款 / 保險投保申請</b></template>
      <el-steps :active="loan.step" finish-status="success" class="mb-3">
        <el-step title="個資" /><el-step title="財務" /><el-step title="文件" /><el-step
          title="授權"
        />
      </el-steps>

      <div v-if="loan.step === 0">
        <el-form :model="loan" label-width="110px">
          <el-form-item label="姓名"><el-input v-model="loan.name" /></el-form-item>
          <el-form-item label="生日"
            ><el-date-picker v-model="loan.birth" type="date"
          /></el-form-item>
          <el-form-item
            ><el-button type="primary" @click="loan.step = 1"
              >下一步</el-button
            ></el-form-item
          >
        </el-form>
      </div>

      <div v-else-if="loan.step === 1">
        <el-form :model="loan" label-width="110px">
          <el-form-item label="年收入"
            ><el-input-number v-model="loan.income" :min="0"
          /></el-form-item>
          <el-form-item label="資產概況"><el-input v-model="loan.assets" /></el-form-item>
          <el-form-item
            ><el-button type="primary" @click="loan.step = 2"
              >下一步</el-button
            ></el-form-item
          >
        </el-form>
      </div>

      <div v-else-if="loan.step === 2">
        <el-form :model="loan" label-width="110px">
          <el-form-item label="文件上傳"
            ><el-upload drag action="#" :auto-upload="false" accept=".jpg,.png,.pdf"
          /></el-form-item>
          <el-form-item
            ><el-button type="primary" @click="loan.step = 3"
              >下一步</el-button
            ></el-form-item
          >
        </el-form>
      </div>

      <div v-else>
        <el-form :model="loan" label-width="110px">
          <el-form-item
            ><el-checkbox v-model="loan.agree"
              >我同意授權與聲明</el-checkbox
            ></el-form-item
          >
          <el-form-item
            ><el-button type="primary" :disabled="!loan.agree" @click="finishLoan"
              >送出申請</el-button
            ></el-form-item
          >
        </el-form>
      </div>
    </el-card>

    <!-- 醫療：就診/手術同意 -->
    <el-card shadow="never">
      <template #header><b>病患就診 / 手術同意書</b></template>
      <el-form ref="medRef" :model="med" :rules="medRules" label-width="120px">
        <el-form-item label="病史" prop="history"
          ><el-input v-model="med.history" type="textarea" :rows="3"
        /></el-form-item>
        <el-form-item label="藥物過敏"><el-input v-model="med.allergy" /></el-form-item>
        <el-form-item label="保險資訊"><el-input v-model="med.insurance" /></el-form-item>
        <el-form-item label="簽名（上傳）" prop="sign"
          ><el-upload action="#" :auto-upload="false" accept=".png,.jpg"
        /></el-form-item>
        <el-form-item
          ><el-checkbox v-model="med.consent">我同意醫療處置</el-checkbox></el-form-item
        >
        <el-form-item
          ><el-button type="primary" @click="submitMed">提交</el-button></el-form-item
        >
      </el-form>
    </el-card>

    <!-- 政府線上申辦 / 稅務申報 -->
    <el-card shadow="never">
      <template #header><b>政府線上申辦 / 稅務申報</b></template>
      <el-form :model="gov" ref="govRef" :rules="govRules" label-width="140px">
        <el-form-item label="身分" prop="idNo"
          ><el-input v-model="gov.idNo" placeholder="身分證/護照號"
        /></el-form-item>
        <el-form-item label="地址" prop="addr"
          ><el-input v-model="gov.addr"
        /></el-form-item>
        <el-form-item label="文件上傳"
          ><el-upload action="#" :auto-upload="false" accept=".pdf,.jpg,.png"
        /></el-form-item>
        <el-form-item label="戶政/稅務編號"
          ><el-input v-model="gov.taxNo"
        /></el-form-item>
        <el-form-item
          ><el-button type="primary" @click="submitGov">送出</el-button></el-form-item
        >
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";

/* 轉帳 */
const txRef = ref();
const tx = reactive({
  payee: "",
  bank: "",
  account: "",
  amount: null,
  purpose: "",
  otp: "",
});
const txRules = {
  payee: [{ required: true, message: "必填", trigger: "blur" }],
  bank: [{ required: true, message: "必選", trigger: "change" }],
  account: [
    { required: true, message: "必填", trigger: "blur" },
    { pattern: /^\d{8,16}$/, message: "8~16 位數", trigger: ["blur", "change"] },
  ],
  amount: [{ required: true, message: "請輸入金額", trigger: "change" }],
  otp: [
    { required: true, message: "請輸入 6 位 OTP", trigger: "blur" },
    { pattern: /^\d{6}$/, message: "6 位數", trigger: ["blur", "change"] },
  ],
};
function submitTx() {
  txRef.value.validate((ok) => ok && ElMessage.success("已送出（demo）"));
}

/* 貸款/保險 */
const loan = reactive({
  step: 0,
  name: "",
  birth: "",
  income: 0,
  assets: "",
  agree: false,
});
function finishLoan() {
  ElMessage.success("申請已送出（demo）");
}

/* 醫療 */
const medRef = ref();
const med = reactive({
  history: "",
  allergy: "",
  insurance: "",
  sign: "",
  consent: false,
});
const medRules = {
  history: [{ required: true, message: "必填", trigger: "blur" }],
  sign: [{ required: true, message: "請上傳簽名", trigger: "change" }],
};
function submitMed() {
  medRef.value.validate((ok) => ok && ElMessage.success("同意書已提交（demo）"));
}

/* 政府/稅務 */
const govRef = ref();
const gov = reactive({ idNo: "", addr: "", taxNo: "" });
const govRules = {
  idNo: [{ required: true, message: "必填", trigger: "blur" }],
  addr: [{ required: true, message: "必填", trigger: "blur" }],
};
function submitGov() {
  govRef.value.validate((ok) => ok && ElMessage.success("已送出（demo）"));
}
</script>

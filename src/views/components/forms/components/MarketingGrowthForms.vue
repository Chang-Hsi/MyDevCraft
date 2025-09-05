<template>
  <div class="space-y-4">
    <!-- 訂閱電子報 / 通知偏好 -->
    <el-card shadow="never">
      <template #header><b>訂閱電子報 / 通知偏好</b></template>
      <el-form ref="subRef" :model="sub" :rules="subRules" label-width="110px">
        <el-form-item label="Email" prop="email"
          ><el-input v-model="sub.email"
        /></el-form-item>
        <el-form-item label="頻率">
          <el-select v-model="sub.freq">
            <el-option label="即時" value="now" />
            <el-option label="每日" value="daily" />
            <el-option label="每週" value="weekly" />
          </el-select>
        </el-form-item>
        <el-form-item label="主題偏好">
          <el-checkbox-group v-model="sub.topics">
            <el-checkbox label="產品更新" />
            <el-checkbox label="折扣/促銷" />
            <el-checkbox label="技術文章" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="推播允許"><el-switch v-model="sub.push" /></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="subscribe">訂閱（Double Opt-in）</el-button>
          <el-button text type="danger" @click="unsubscribe">取消訂閱</el-button>
        </el-form-item>
      </el-form>
      <el-dialog v-model="optinVisible" title="請確認訂閱" width="420px">
        我們已寄出確認信到 <b>{{ sub.email }}</b
        >，請點擊信中按鈕完成訂閱。
        <template #footer
          ><el-button type="primary" @click="optinVisible = false"
            >知道了</el-button
          ></template
        >
      </el-dialog>
    </el-card>

    <!-- 優惠券 / 兌換碼 -->
    <el-card shadow="never">
      <template #header><b>優惠券 / 兌換碼</b></template>
      <div class="flex items-center gap-2 max-w-lg">
        <el-input v-model="promo" placeholder="輸入 Promo Code" @input="normalizePromo" />
        <el-button type="primary" @click="applyPromo">套用</el-button>
      </div>
      <el-alert
        v-if="promoMsg"
        :title="promoMsg"
        :type="promoOk ? 'success' : 'error'"
        class="mt-3"
        show-icon
      />
    </el-card>

    <!-- 推薦好友 / 白名單 -->
    <el-card shadow="never">
      <template #header><b>推薦好友 / 申請白名單</b></template>
      <el-form ref="refRef" :model="referral" :rules="referralRules" label-width="110px">
        <el-form-item label="被推薦人 Email" prop="email"
          ><el-input v-model="referral.email"
        /></el-form-item>
        <el-form-item label="備註"
          ><el-input v-model="referral.note" type="textarea" :rows="3"
        /></el-form-item>
        <el-form-item>
          <el-checkbox v-model="referral.agree">我已閱讀並同意條款</el-checkbox>
          <el-button link type="primary" @click="termsVisible = true">查看條款</el-button>
        </el-form-item>
        <el-form-item
          ><el-button type="primary" @click="sendReferral">送出</el-button></el-form-item
        >
      </el-form>

      <el-dialog v-model="termsVisible" title="活動條款" width="560px">
        <p class="text-sm text-gray-600">此處可放活動條款與個資告知……（demo）</p>
        <template #footer
          ><el-button type="primary" @click="termsVisible = false"
            >關閉</el-button
          ></template
        >
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

/* 訂閱 */
const subRef = ref();
const sub = reactive({ email: "", freq: "weekly", topics: [], push: true });
const subRules = {
  email: [
    { required: true, message: "請輸入 Email", trigger: "blur" },
    { type: "email", message: "格式不正確", trigger: ["blur", "change"] },
  ],
};
const optinVisible = ref(false);
function subscribe() {
  subRef.value.validate((ok) => ok && (optinVisible.value = true));
}
function unsubscribe() {
  ElMessage.success("已取消訂閱（demo）");
}

/* Promo */
const promo = ref("");
const promoOk = ref(false);
const promoMsg = ref("");
function normalizePromo() {
  promo.value = promo.value.toUpperCase().replace(/\s+/g, "");
}
function applyPromo() {
  if (!promo.value) return (promoMsg.value = "請輸入兌換碼"), (promoOk.value = false);
  // demo 規則：WELCOME10 可用，其餘無效
  promoOk.value = promo.value === "WELCOME10";
  promoMsg.value = promoOk.value ? "已套用優惠碼：9 折" : "無效或不可併用";
}

/* Referral */
const refRef = ref();
const termsVisible = ref(false);
const referral = reactive({ email: "", note: "", agree: false });
const referralRules = {
  email: [
    { required: true, message: "請輸入 Email", trigger: "blur" },
    { type: "email", message: "格式不正確", trigger: ["blur", "change"] },
  ],
  agree: [
    {
      validator: (_, v, cb) => (referral.agree ? cb() : cb(new Error("請勾選同意條款"))),
      trigger: "change",
    },
  ],
};
function sendReferral() {
  refRef.value.validate((ok) => ok && ElMessage.success("已送出（demo）"));
}
</script>

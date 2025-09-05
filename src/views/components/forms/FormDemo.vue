<template>
  <el-card shadow="never" :body-style="{ padding: '12px 16px' }" class="rounded-xl">
    <div class="flex items-center justify-between">
      <div class="text-lg font-semibold">表單組件示例</div>
    </div>
    <el-divider class="!my-3" />

    <el-tabs v-model="active" class="min-h-[520px]">
      <el-tab-pane label="｜帳號與安全" name="A"><AccountSecurityForms /></el-tab-pane>
      <el-tab-pane label="｜使用者資料與驗證" name="B"><UserProfileForms /></el-tab-pane>
      <el-tab-pane label="｜搜尋與篩選" name="C"><SearchFilterForms /></el-tab-pane>
      <el-tab-pane label="｜商務與支付" name="D"><CommercePaymentForms /></el-tab-pane>
      <el-tab-pane label="｜預約與票務" name="E"><BookingTicketingForms /></el-tab-pane>
      <el-tab-pane label="｜內容與社群" name="F"><ContentSocialForms /></el-tab-pane>
      <el-tab-pane label="｜客服與回饋" name="G"><SupportFeedbackForms /></el-tab-pane>
      <el-tab-pane label="｜行銷與成長" name="H"><MarketingGrowthForms /></el-tab-pane>
      <el-tab-pane label="｜企業／後台運營" name="I"
        ><AdminOperationsForms
      /></el-tab-pane>
      <el-tab-pane label="｜金融／政務／醫療" name="J"
        ><FinanceGovernmentHealthcareForms
      /></el-tab-pane>
      <el-tab-pane label="｜求職與教育" name="K"><JobsEducationForms /></el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup>
import { ref } from "vue";
import AccountSecurityForms from "./components/AccountSecurityForms.vue";
import UserProfileForms from "./components/UserProfileForms.vue";
import SearchFilterForms from "./components/SearchFilterForms.vue";
import CommercePaymentForms from "./components/CommercePaymentForms.vue";
import BookingTicketingForms from "./components/BookingTicketingForms.vue";
import ContentSocialForms from "./components/ContentSocialForms.vue";
import SupportFeedbackForms from "./components/SupportFeedbackForms.vue";
import MarketingGrowthForms from "./components/MarketingGrowthForms.vue";
import AdminOperationsForms from "./components/AdminOperationsForms.vue";
import FinanceGovernmentHealthcareForms from "./components/FinanceGovernmentHealthcareForms.vue";
import JobsEducationForms from "./components/JobsEducationForms.vue";

const active = ref("A");
</script>

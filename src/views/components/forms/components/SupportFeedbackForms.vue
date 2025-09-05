<template>
  <div class="space-y-4">
    <!-- 工單 / 聯絡我們 -->
    <el-card shadow="never">
      <template #header><b>工單（Ticket）/ 聯絡我們</b></template>
      <el-form ref="ticketRef" :model="ticket" :rules="ticketRules" label-width="100px">
        <el-form-item label="分類" prop="category">
          <el-select v-model="ticket.category" placeholder="請選擇">
            <el-option label="帳務" value="billing" />
            <el-option label="技術" value="tech" />
            <el-option label="建議/回饋" value="feedback" />
          </el-select>
        </el-form-item>
        <el-form-item label="主旨" prop="subject"
          ><el-input v-model="ticket.subject"
        /></el-form-item>
        <el-form-item label="內容" prop="content">
          <el-input
            v-model="ticket.content"
            type="textarea"
            :rows="5"
            show-word-limit
            maxlength="1000"
          />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
            action="#"
            :auto-upload="false"
            :before-upload="beforeFile"
            :limit="5"
            accept=".png,.jpg,.jpeg,.pdf"
          >
            <el-button>選擇檔案</el-button>
            <template #tip>
              <div class="el-upload__tip text-xs">
                PNG/JPG/PDF，單檔 &lt; 5MB，最多 5 個
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="優先級">
          <el-radio-group v-model="ticket.priority">
            <el-radio label="low">低</el-radio>
            <el-radio label="normal">一般</el-radio>
            <el-radio label="high">高</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="抄送">
          <el-select
            v-model="ticket.cc"
            multiple
            filterable
            allow-create
            placeholder="輸入 Email 後 Enter"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitTicket">送出工單</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- NPS / 問卷 -->
    <el-card shadow="never">
      <template #header><b>NPS / 滿意度調查 / 問卷</b></template>

      <el-form ref="surveyRef" :model="survey" :rules="surveyRules" label-width="120px">
        <el-form-item label="NPS（0~10）" prop="nps">
          <div class="flex items-center gap-3 w-full">
            <el-slider v-model="survey.nps" :min="0" :max="10" :step="1" class="flex-1" />
            <span class="w-8 text-center font-semibold">{{ survey.nps }}</span>
          </div>
        </el-form-item>

        <el-form-item label="整體滿意度" prop="rate">
          <el-rate v-model="survey.rate" />
        </el-form-item>

        <el-form-item label="推薦理由" prop="reason">
          <el-radio-group v-model="survey.reason">
            <el-radio label="功能好用" />
            <el-radio label="價格合理" />
            <el-radio label="客服優質" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label="期望功能">
          <el-checkbox-group v-model="survey.expect">
            <el-checkbox label="深色模式" />
            <el-checkbox label="離線使用" />
            <el-checkbox label="更多報表" />
          </el-checkbox-group>
        </el-form-item>

        <!-- 跳題邏輯：當 rate <= 3，顯示「主要問題」 -->
        <el-form-item
          v-if="survey.rate && survey.rate <= 3"
          label="主要問題（必填）"
          prop="issue"
        >
          <el-input
            v-model="survey.issue"
            type="textarea"
            :rows="3"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="其他意見">
          <el-input
            v-model="survey.comment"
            type="textarea"
            :rows="3"
            maxlength="300"
            show-word-limit
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitSurvey">提交問卷</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";

/* Ticket */
const ticketRef = ref();
const ticket = reactive({
  category: "",
  subject: "",
  content: "",
  priority: "normal",
  cc: [],
});
const ticketRules = {
  category: [{ required: true, message: "請選擇分類", trigger: "change" }],
  subject: [{ required: true, message: "請輸入主旨", trigger: "blur" }],
  content: [
    { required: true, message: "請輸入內容", trigger: "blur" },
    { min: 10, message: "至少 10 字", trigger: "blur" },
  ],
};
function beforeFile(file) {
  const ok = file.size / 1024 / 1024 < 5;
  if (!ok) ElMessage.error("單檔大小不可超過 5MB");
  return ok;
}
function submitTicket() {
  ticketRef.value.validate((ok) => ok && ElMessage.success("已送出工單（demo）"));
}

/* Survey */
const surveyRef = ref();
const survey = reactive({
  nps: 7,
  rate: 5,
  reason: "",
  expect: [],
  issue: "",
  comment: "",
});
const surveyRules = {
  nps: [{ required: true, message: "請評分", trigger: "change" }],
  rate: [{ required: true, message: "請評分", trigger: "change" }],
  reason: [{ required: true, message: "請選擇", trigger: "change" }],
  // 動態必填：rate<=3 要求 issue
  issue: [
    {
      validator: (_, v, cb) =>
        survey.rate && survey.rate <= 3 && !v ? cb(new Error("請填寫主要問題")) : cb(),
      trigger: "blur",
    },
  ],
};
function submitSurvey() {
  surveyRef.value.validate((ok) => ok && ElMessage.success("問卷已提交（demo）"));
}
</script>

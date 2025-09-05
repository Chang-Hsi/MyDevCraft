<template>
  <div class="space-y-4">
    <!-- 履歷 / 投遞 -->
    <el-card shadow="never">
      <template #header><b>履歷 / 職缺投遞</b></template>
      <el-form ref="jobRef" :model="job" :rules="jobRules" label-width="110px">
        <el-form-item label="姓名" prop="name"
          ><el-input v-model="job.name"
        /></el-form-item>
        <el-form-item label="Email" prop="email"
          ><el-input v-model="job.email"
        /></el-form-item>
        <el-form-item label="作品連結"
          ><el-input v-model="job.portfolio" placeholder="https://…"
        /></el-form-item>
        <el-form-item label="履歷檔" prop="resume">
          <el-upload
            action="#"
            :auto-upload="false"
            accept=".pdf,.doc,.docx"
            :before-upload="beforeResume"
          >
            <el-button>上傳履歷</el-button>
            <template #tip
              ><div class="el-upload__tip text-xs">PDF/DOC，&lt; 10MB</div></template
            >
          </el-upload>
        </el-form-item>
        <el-form-item label="Cover Letter">
          <el-input
            v-model="job.cover"
            type="textarea"
            :rows="4"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item
          ><el-button type="primary" @click="submitJob">送出</el-button></el-form-item
        >
      </el-form>
    </el-card>

    <!-- 課程報名 / 線上考試 -->
    <el-card shadow="never">
      <template #header><b>課程報名 / 線上考試</b></template>
      <el-form ref="eduRef" :model="edu" :rules="eduRules" label-width="110px">
        <el-form-item label="班別" prop="class">
          <el-radio-group v-model="edu.class">
            <el-radio label="前端入門" /><el-radio label="資料視覺化" /><el-radio
              label="後端基礎"
            />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="時段"
          ><el-select v-model="edu.slot"
            ><el-option label="平日夜間" value="night" /><el-option
              label="週末全天"
              value="weekend" /></el-select
        ></el-form-item>
        <el-form-item label="測驗題（多選）" prop="quiz">
          <el-checkbox-group v-model="edu.quiz">
            <el-checkbox label="HTML" /><el-checkbox label="CSS" /><el-checkbox
              label="JavaScript"
            />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="上傳作業"
          ><el-upload action="#" :auto-upload="false" multiple
        /></el-form-item>
        <el-form-item
          ><el-button type="primary" @click="submitEdu">報名</el-button></el-form-item
        >
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";

/* 職缺 */
const jobRef = ref();
const job = reactive({ name: "", email: "", portfolio: "", cover: "" });
const jobRules = {
  name: [{ required: true, message: "必填", trigger: "blur" }],
  email: [
    { required: true, message: "請輸入 Email", trigger: "blur" },
    { type: "email", message: "格式不正確", trigger: ["blur", "change"] },
  ],
  portfolio: [
    {
      pattern: /^https?:\/\//i,
      message: "請輸入正確連結（可留白）",
      trigger: ["blur", "change"],
    },
  ],
};
function beforeResume(file) {
  const ok = file.size < 10 * 1024 * 1024;
  if (!ok) ElMessage.error("履歷需小於 10MB");
  return ok;
}
function submitJob() {
  jobRef.value.validate((ok) => ok && ElMessage.success("已投遞（demo）"));
}

/* 教育 */
const eduRef = ref();
const edu = reactive({ class: "", slot: "night", quiz: [] });
const eduRules = {
  class: [{ required: true, message: "請選擇班別", trigger: "change" }],
  quiz: [
    {
      validator: (_, v, cb) =>
        v && v.length > 0 ? cb() : cb(new Error("請至少勾選一題")),
      trigger: "change",
    },
  ],
};
function submitEdu() {
  eduRef.value.validate((ok) => ok && ElMessage.success("報名成功（demo）"));
}
</script>

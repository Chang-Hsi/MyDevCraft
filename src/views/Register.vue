<template>
  <div style="width: 680px; max-width: 90%" class="h-[700px] p-20 pt-28">
    <span class="text-3xl font-extrabold flex justify-center pb-8">註冊</span>

    <el-form
      ref="regRef"
      :model="reg"
      :rules="rules"
      label-position="top"
      label-style="font-size: 18px; font-weight: 600;"
      :show-message="true"
    >
      <el-form-item label="帳號" prop="username">
        <el-input v-model="reg.username" size="large" autocomplete="username" />
      </el-form-item>

      <el-form-item label="電子郵件" prop="email">
        <el-input v-model="reg.email" size="large" autocomplete="email" />
      </el-form-item>

      <el-form-item label="密碼" prop="password">
        <el-input
          v-model="reg.password"
          type="password"
          size="large"
          autocomplete="new-password"
        />
      </el-form-item>

      <el-form-item label="確認密碼" prop="confirm">
        <el-input
          v-model="reg.confirm"
          type="password"
          size="large"
          autocomplete="new-password"
        />
      </el-form-item>

      <!-- 勾選條款 -->
      <el-form-item prop="agree">
        <el-checkbox v-model="reg.agree">
          我已閱讀並同意服務條款與隱私權政策
        </el-checkbox>
      </el-form-item>

      <div class="flex flex-col gap-4">
        <el-button
          type="primary"
          size="large"
          class="w-full"
          :loading="loading"
          @click="onRegister"
        >
          <span class="text-lg">建立帳號</span>
        </el-button>

        <el-button
          type="default"
          size="large"
          class="w-full"
          @click="$emit('go-login')"
          style="margin-left: 0px"
        >
          <span class="text-lg">已有帳號？前往登錄</span>
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";

// 新增：回到登入/註冊成功事件（父層可接收）
const emit = defineEmits(["go-login", "registered"]);

const regRef = ref();
const loading = ref(false);

// 新增：註冊表單資料
const reg = reactive({
  username: "",
  email: "",
  password: "",
  confirm: "",
  agree: false,
});

// 新增：自訂驗證
const validateConfirm = (rule, value, callback) => {
  if (!value) return callback(new Error("請再次輸入密碼"));
  if (value !== reg.password) return callback(new Error("兩次輸入的密碼不一致"));
  callback();
};
const validateAgree = (rule, value, callback) => {
  if (!reg.agree) return callback(new Error("請勾選同意條款"));
  callback();
};

// 新增：規則
const rules = {
  username: [
    { required: true, message: "請輸入帳號", trigger: "blur" },
    { min: 2, max: 20, message: "長度 2–20 字", trigger: "blur" },
  ],
  email: [
    { required: true, message: "請輸入電子郵件", trigger: "blur" },
    { type: "email", message: "請輸入正確的電子郵件", trigger: "blur" },
  ],
  password: [
    { required: true, message: "請輸入密碼", trigger: "blur" },
    { min: 6, max: 20, message: "長度 6–20 字", trigger: "blur" },
  ],
  confirm: [{ validator: validateConfirm, trigger: "blur" }],
  agree: [{ validator: validateAgree, trigger: "change" }],
};

// 新增：送出註冊（示範流程）
const onRegister = () => {
  regRef.value?.validate(async (valid) => {
    if (!valid) return;
    loading.value = true;
    try {
      // 這裡串接後端 API（示範先直接成功）
      console.log("[Register] 送出註冊：", { ...reg, password: "***", confirm: "***" });
      // 註冊成功 → 通知父層
      emit("registered", { username: reg.username, email: reg.email });
      // 回到登入畫面
      emit("go-login");
    } catch (e) {
      console.error("[Register] 註冊例外：", e);
    } finally {
      loading.value = false;
    }
  });
};
</script>

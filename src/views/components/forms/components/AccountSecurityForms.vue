<template>
  <div class="space-y-4">
    <!-- 1) 登入 / 註冊 -->
    <el-card shadow="never">
      <template #header><b>登入 / 註冊</b></template>

      <el-tabs v-model="authTab" class="mt-1">
        <el-tab-pane label="登入" name="login">
          <el-form
            ref="loginRef"
            :model="login"
            :rules="loginRules"
            label-width="90px"
            status-icon
          >
            <el-form-item label="Email" prop="email">
              <el-input v-model="login.email" placeholder="you@example.com" />
            </el-form-item>
            <el-form-item label="密碼" prop="password">
              <el-input v-model="login.password" type="password" show-password />
            </el-form-item>
            <div class="flex items-center justify-between pb-2 pl-22">
              <el-checkbox v-model="login.remember">記住我</el-checkbox>
              <el-link type="primary" @click="authTab = 'register'"
                >沒有帳號？去註冊</el-link
              >
            </div>
            <el-form-item>
              <el-button type="primary" :loading="loading.login" @click="submitLogin"
                >登入</el-button
              >
              <el-button link @click="authTab = 'reset'">忘記密碼？</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="註冊" name="register">
          <el-form
            ref="regRef"
            :model="reg"
            :rules="regRules"
            label-width="90px"
            status-icon
          >
            <el-form-item label="Email" prop="email">
              <el-input v-model="reg.email" />
            </el-form-item>
            <el-form-item label="密碼" prop="password">
              <el-input v-model="reg.password" type="password" show-password />
            </el-form-item>
            <el-form-item label="確認密碼" prop="confirm">
              <el-input v-model="reg.confirm" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading.register"
                @click="submitRegister"
                >建立帳號</el-button
              >
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="重設密碼" name="reset">
          <el-steps :active="stepsActive" finish-status="success" class="mb-3">
            <el-step title="輸入信箱" />
            <el-step title="設定新密碼" />
            <el-step title="完成" />
          </el-steps>

          <div v-if="reset.step === 0">
            <el-form :model="reset" label-width="90px">
              <el-form-item label="Email">
                <el-input v-model="reset.email" />
              </el-form-item>
              <el-button type="primary" @click="sendResetToken">寄出連結</el-button>
            </el-form>
          </div>

          <div v-else-if="reset.step === 1">
            <el-form :model="reset" :rules="resetRules" ref="resetRef" label-width="90px">
              <el-form-item label="新密碼" prop="newPassword">
                <el-input v-model="reset.newPassword" type="password" show-password />
              </el-form-item>
              <el-form-item label="再次輸入" prop="confirmNew">
                <el-input v-model="reset.confirmNew" type="password" show-password />
              </el-form-item>
              <el-button type="primary" @click="finishReset">儲存</el-button>
            </el-form>
          </div>

          <el-result
            v-else
            icon="success"
            title="已重設完成"
            sub-title="請用新密碼登入。"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- ② OTP / 2FA -->
    <el-card shadow="never">
      <template #header><b>OTP / 兩步驗證</b></template>
      <div class="text-gray-500 mb-2">請輸入 6 位數驗證碼：</div>
      <div class="flex gap-2" @paste.capture="onOtpPaste">
        <el-input
          v-for="(_, i) in 6"
          :key="i"
          v-model="otp[i]"
          size="large"
          maxlength="1"
          type="tel"
          autocomplete="one-time-code"
          class="!w-10 text-center"
          :ref="(el) => (otpRefs[i] = el)"
          @input="onOtpInput(i)"
          @keydown="onOtpKeydown(i, $event)"
        />
      </div>

      <div class="mt-3 flex items-center">
        <el-button type="primary" :disabled="otp.join('').length < 6" @click="verifyOtp"
          >驗證</el-button
        >
        <el-button :disabled="countdown > 0" @click="resend">
          重新發送<span v-if="countdown > 0">（{{ countdown }}s）</span>
        </el-button>
        <el-alert
          v-if="otpMsg"
          :title="otpMsg"
          :type="otpOk ? 'success' : 'error'"
          :closable="false"
          show-icon
        />
      </div>
    </el-card>

    <!-- 3) RBAC 權限配置（卡片版） -->
    <el-card shadow="never">
      <template #header><b>權限 / 角色配置</b></template>

      <!-- 角色選擇（靠左、在最上面） -->
      <div class="mb-4">
        <el-form label-width="40px">
          <el-form-item label="角色">
            <el-select v-model="role" class="!w-60">
              <el-option label="Admin" value="admin" />
              <el-option label="Staff" value="staff" />
              <el-option label="Viewer" value="viewer" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 群組（大標題）→ 模組卡片（開關 + 權限） 垂直從上到下 -->
      <div class="space-y-8">
        <div
          v-for="g in permGroups"
          :key="g.groupId"
          class="grid grid-cols-12 gap-4 items-start"
        >
          <!-- 左邊群組標題 -->
          <div class="col-span-12 md:col-span-2">
            <div class="text-xl font-bold text-slate-800">{{ g.groupName }}</div>
          </div>

          <!-- 右邊模組卡片（可多張） -->
          <div class="col-span-12 md:col-span-10 space-y-3">
            <el-card
              v-for="m in g.modules"
              :key="m.id"
              shadow="never"
              class="rounded-lg border border-gray-200"
              :body-style="{ padding: '12px 16px' }"
            >
              <!-- 卡片標題列：開關 + 名稱 -->
              <div class="flex items-center gap-3">
                <el-switch v-model="moduleOn[m.id]" @change="onToggleModule(m)" />
                <div class="font-semibold text-slate-800">{{ m.name }}</div>
              </div>

              <!-- 權限勾選（視情況顯示） -->
              <div
                v-if="m.actions && m.actions.length"
                class="mt-3 flex flex-wrap items-center gap-6"
              >
                <el-checkbox-group
                  v-model="checkedActions[m.id]"
                  :disabled="!moduleOn[m.id]"
                  @change="(vals) => onActionsChange(m, vals)"
                >
                  <el-checkbox v-for="a in m.actions" :key="a.id" :label="a.id">
                    {{ a.label }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </el-card>
          </div>
        </div>
      </div>

      <!-- 底部操作按鈕（置左） -->
      <div class="mt-4">
        <el-button type="primary" @click="saveRBAC">儲存授權</el-button>
        <el-button @click="clearRBAC">清空</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from "vue";
import { ElMessage } from "element-plus";

/* ---------- 登入 / 註冊 ---------- */
const authTab = ref("login");
const loading = reactive({ login: false, register: false });

const emailRule = [
  { required: true, message: "請輸入 Email", trigger: "blur" },
  { type: "email", message: "Email 格式不正確", trigger: ["blur", "change"] },
];
const passRule = [
  { required: true, message: "請輸入密碼", trigger: "blur" },
  { min: 6, message: "至少 6 碼", trigger: "blur" },
];

const loginRef = ref();
const login = reactive({ email: "", password: "", remember: true });
const loginRules = { email: emailRule, password: passRule };

async function submitLogin() {
  await loginRef.value.validate(async (ok) => {
    if (!ok) return;
    loading.login = true;
    setTimeout(() => {
      loading.login = false;
      ElMessage.success("登入成功（demo）");
    }, 800);
  });
}

const regRef = ref();
const reg = reactive({ email: "", password: "", confirm: "" });
const regRules = {
  email: emailRule,
  password: passRule,
  confirm: [
    { required: true, message: "請再次輸入密碼", trigger: "blur" },
    {
      validator: (_, v, cb) =>
        v !== reg.password ? cb(new Error("兩次密碼不一致")) : cb(),
      trigger: ["blur", "change"],
    },
  ],
};
function submitRegister() {
  regRef.value.validate((ok) => {
    if (!ok) return;
    loading.register = true;
    setTimeout(() => {
      loading.register = false;
      ElMessage.success("註冊成功（demo）");
      authTab.value = "login";
    }, 800);
  });
}

/* ---------- 重設密碼 ---------- */
const resetRef = ref();
const reset = reactive({ step: 0, email: "", newPassword: "", confirmNew: "" });

const resetRules = {
  newPassword: passRule,
  confirmNew: [
    { required: true, message: "請再次輸入", trigger: "blur" },
    {
      validator: (_, v, cb) =>
        v !== reset.newPassword ? cb(new Error("兩次密碼不一致")) : cb(),
      trigger: ["blur", "change"],
    },
  ],
};

const stepsActive = computed(() => {
  if (reset.step === 0) return 0; // 第1步進行中
  if (reset.step === 1) return 1; // 第2步進行中
  return 3; // ✅ 完成（步驟數 = 3）
});

const sendResetToken = () => {
  if (!reset.email) return ElMessage.error("請輸入 Email");
  reset.step = 1;
};

const finishReset = () => {
  resetRef.value.validate((ok) => {
    if (!ok) return;
    reset.step = 2; // 視圖=完成；Steps 會因 computed 顯示 active=3
  });
};
/* ---------- OTP / 2FA ---------- */
const otp = ref(Array(6).fill(""));
const otpRefs = ref([]); // 存每一格 el-input 實例

const onlyDigit = (s = "") => s.replace(/\D/g, "");

function focusOtp(i) {
  const inst = otpRefs.value[i];
  if (inst && typeof inst.focus === "function") inst.focus();
}

// 使用者輸入：只保留 1 位數字，若有值就跳到下一格
function onOtpInput(i) {
  otp.value[i] = onlyDigit(otp.value[i]).slice(0, 1);
  if (otp.value[i] && i < 5) focusOtp(i + 1);
}

// 鍵盤限制：只允許 0~9 及控制鍵；Backspace 空格時往前跳
function onOtpKeydown(i, e) {
  const k = e.key;
  const control = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"];
  if (control.includes(k)) {
    if (k === "Backspace") {
      if (otp.value[i]) {
        otp.value[i] = ""; // 先清掉本格
      } else if (i > 0) {
        e.preventDefault();
        focusOtp(i - 1);
        otp.value[i - 1] = "";
      }
    }
    return;
  }

  // 只收單一數字鍵：覆寫本格並跳下一格
  if (/^\d$/.test(k)) {
    e.preventDefault();
    otp.value[i] = k;
    if (i < 5) focusOtp(i + 1);
    return;
  }

  // 其他一律擋掉
  e.preventDefault();
}

// 支援一次貼上 6 碼（自動分散到六格）
function onOtpPaste(e) {
  const text = (e.clipboardData?.getData("text") || "").trim();
  const arr = onlyDigit(text).slice(0, 6).split("");
  if (!arr.length) return;
  e.preventDefault();
  for (let j = 0; j < 6; j++) otp.value[j] = arr[j] || "";
  // 聚焦到下一個待輸入位置
  const next = Math.min(arr.length, 5);
  focusOtp(next);
}

/* ---------- RBAC（簡化示意） ---------- */
const permGroups = reactive([
  {
    groupId: "storeDash",
    groupName: "門市儀表板",
    modules: [{ id: "dash:main", name: "門市儀表板", actions: [] }],
  },
  {
    groupId: "member",
    groupName: "會員中心",
    modules: [
      {
        id: "member:manage",
        name: "會員管理",
        actions: [
          { id: "member:create", label: "新增" },
          { id: "member:edit", label: "編輯" },
          { id: "member:disable", label: "停權" },
        ],
      },
      {
        id: "deposit",
        name: "儲值管理",
        actions: [
          { id: "deposit:reprint", label: "重印發票" },
          { id: "deposit:cancel", label: "取消" },
        ],
      },
    ],
  },
  {
    groupId: "ops",
    groupName: "門市作業",
    modules: [
      {
        id: "ops:receive",
        name: "收件",
        actions: [
          { id: "ops:pickup", label: "取件" },
          { id: "ops:factory", label: "在廠" },
          { id: "ops:pay", label: "付款" },
          { id: "ops:deposit", label: "儲值" },
        ],
      },
    ],
  },
]);

/** 模組開關狀態：moduleId -> Boolean */
const moduleOn = reactive({});
/** 各模組已勾選動作：moduleId -> string[] */
const checkedActions = reactive({});

/** 初始化 map（避免 v-model 找不到 key） */
permGroups.forEach((g) =>
  g.modules.forEach((m) => {
    moduleOn[m.id] = false;
    checkedActions[m.id] = [];
  })
);

/** 角色（沿用你原本的） */
const role = ref("admin");

/** 各角色的預設權限集合（可依實際需求調整） */
const roleDefaults = {
  admin: {
    modules: ["dash:main", "member:manage", "deposit", "ops:receive"],
    actions: [
      "member:create",
      "member:edit",
      "member:disable",
      "deposit:reprint",
      "deposit:cancel",
      "ops:pickup",
      "ops:factory",
      "ops:pay",
      "ops:deposit",
    ],
  },
  staff: {
    modules: ["dash:main", "member:manage", "ops:receive"],
    actions: ["member:create", "member:edit", "ops:pickup", "ops:pay"],
  },
  viewer: {
    modules: ["dash:main"],
    actions: [],
  },
};

/** 依角色套用預設 */
function applyRole(r) {
  // 先清空
  Object.keys(moduleOn).forEach((k) => (moduleOn[k] = false));
  Object.keys(checkedActions).forEach((k) => (checkedActions[k] = []));

  const def = roleDefaults[r] || { modules: [], actions: [] };

  def.modules.forEach((mid) => (moduleOn[mid] = true));

  def.actions.forEach((aid) => {
    const mid = findModuleIdByAction(aid);
    if (mid) {
      if (!moduleOn[mid]) moduleOn[mid] = true; // 勾動作時也開模組開關
      if (!checkedActions[mid]) checkedActions[mid] = [];
      if (!checkedActions[mid].includes(aid)) checkedActions[mid].push(aid);
    }
  });
}

/** 由動作 id 找到所屬模組 id */
function findModuleIdByAction(aid) {
  for (const g of permGroups) {
    for (const m of g.modules) {
      if (m.actions?.some((a) => a.id === aid)) return m.id;
    }
  }
  return null;
}

/** 模組開關：開啟即（若尚未勾選）預設全勾；關閉則清空該模組動作 */
function onToggleModule(m) {
  if (moduleOn[m.id]) {
    if (checkedActions[m.id].length === 0 && m.actions?.length) {
      checkedActions[m.id] = m.actions.map((a) => a.id);
    }
  } else {
    checkedActions[m.id] = [];
  }
}

/** 取得所有選取的 key（回存後端可用） */
function getCheckedKeys() {
  const keys = [];
  // 模組
  Object.entries(moduleOn).forEach(([mid, on]) => {
    if (on) keys.push(mid);
  });
  // 動作
  permGroups.forEach((g) =>
    g.modules.forEach((m) => {
      (checkedActions[m.id] || []).forEach((aid) => keys.push(aid));
    })
  );
  return keys;
}

function onActionsChange(m, vals) {
  // vals 是目前該模組勾選中的動作陣列
  if (Array.isArray(vals) && vals.length === 0) {
    // 全部都取消，關閉開關（onToggleModule 會把動作清空；此時已是空，安全）
    if (moduleOn[m.id]) moduleOn[m.id] = false;
  } else {
    // 只要有勾任一個，確保開關為開
    if (!moduleOn[m.id]) moduleOn[m.id] = true;
  }
}

/** 儲存 / 清空 */
function saveRBAC() {
  const keys = getCheckedKeys();
  ElMessage.success("已儲存：" + JSON.stringify(keys));
}
function clearRBAC() {
  Object.keys(moduleOn).forEach((k) => (moduleOn[k] = false));
  Object.keys(checkedActions).forEach((k) => (checkedActions[k] = []));
}

/** 角色變更即套用預設（與你原本 watch 行為一致） */
watch(role, (r) => applyRole(r), { immediate: true });
</script>

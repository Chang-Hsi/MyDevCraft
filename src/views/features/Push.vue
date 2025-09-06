<template>
  <div class="p-6 space-y-6">
    <!-- 上方工具列 -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold">Web 推播管理</h2>
      <div class="flex gap-2">
        <el-button @click="reloadLocalJobs">重新整理</el-button>
        <el-button type="primary" @click="openCreateDialog">新增推播</el-button>
      </div>
    </div>

    <!-- ===== 瀏覽器通知狀態 ===== -->
    <el-card shadow="never">
      <template #header><b>瀏覽器通知狀態</b></template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <div>
            支援度：<b>{{ supportText }}</b>
          </div>
          <div>
            權限：<b>{{ permission }}</b>
          </div>

          <div class="flex gap-2">
            <el-button
              type="primary"
              :disabled="!supported || permission === 'granted'"
              @click="enableNotification"
              :loading="enabling"
              >啟用瀏覽器通知</el-button
            >

            <el-button :disabled="!supported" @click="refreshToken"
              >重新取得 Token</el-button
            >
            <el-button :disabled="!token" @click="copyToken">複製 Token</el-button>
          </div>

          <el-input
            type="textarea"
            :rows="3"
            placeholder="FCM Token（成功啟用後會出現，可在下方『新增推播』使用）"
            v-model="token"
            readonly
          />
        </div>

        <div class="space-y-2">
          <div class="text-gray-600">前景推播測試（不經 FCM，純本機測試通知外觀）：</div>
          <div class="flex gap-2">
            <el-button @click="showLocalNotification" :disabled="!registration"
              >顯示本機通知</el-button
            >
            <el-button type="success" @click="showElMessage"
              >模擬前景訊息（onMessage）</el-button
            >
          </div>
          <el-alert
            title="正式推播由下方『新增推播』送到 Netlify Functions 代發；排程由 Netlify 的排程 Function 每分鐘執行。"
            type="info"
            show-icon
          />
        </div>
      </div>
    </el-card>

    <!-- ===== 推播列表 ===== -->
    <el-table :data="pushList" border style="width: 100%">
      <el-table-column prop="id" label="編號" width="80" />
      <el-table-column prop="title" label="推播標題" min-width="220" />
      <el-table-column prop="body" label="內容" min-width="260" show-overflow-tooltip />
      <el-table-column prop="link" label="連結" min-width="180" show-overflow-tooltip />
      <el-table-column label="型態" width="80">
        <template #default="{ row }">
          <el-tag size="small" effect="light">{{
            row.mode === "now" ? "立即" : "排程"
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sendAtText" label="預定時間" width="180" />
      <el-table-column label="狀態" width="120" align="center">
        <template #default="{ row }">
          <el-tag
            v-if="row.status === '成功' || row.status === 'sent'"
            type="success"
            effect="light"
            >成功</el-tag
          >
          <el-tag
            v-else-if="
              row.status === 'scheduled' ||
              row.status === 'pending' ||
              row.status === 'processing'
            "
            type="warning"
            effect="light"
            >已排程</el-tag
          >
          <el-tag v-else-if="row.status === 'canceled'" type="info" effect="light"
            >已取消</el-tag
          >
          <el-tag v-else-if="row.status === 'error'" type="danger" effect="light"
            >失敗</el-tag
          >
          <el-tag v-else effect="light">{{ row.status || "—" }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row, $index }">
          <el-button
            size="small"
            @click="openEditDialog(row)"
            :disabled="row.status === '成功' || row.status === 'sent'"
            >編輯</el-button
          >
          <el-button size="small" type="danger" plain @click="removeLocal(row, $index)">
            {{
              row.status === "pending" || row.status === "processing"
                ? "取消(僅前端示意)"
                : "刪除"
            }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- ===== 新增/編輯 推播 dialog ===== -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '編輯推播' : '新增推播'"
      width="540px"
    >
      <div class="space-y-3">
        <el-input v-model="form.title" placeholder="標題（必填）" />
        <el-input v-model="form.body" placeholder="內容（必填）" />
        <el-input v-model="form.link" placeholder="點擊開啟的連結（預設 / ）" />

        <el-select v-model="form.mode" class="w-full">
          <el-option label="立即發送" value="now" />
          <el-option label="排程發送" value="later" />
        </el-select>

        <div v-if="form.mode === 'later'" class="flex items-center gap-2">
          <span class="text-gray-500 w-20">發送時間</span>
          <el-date-picker
            v-model="form.sendAt"
            type="datetime"
            placeholder="選擇日期時間"
            :disabled-date="(d) => d.getTime() < Date.now() - 60_000"
          />
        </div>

        <el-alert
          title="預設用本機取得的 Token。也可輸入多個 Token（每行一個）。"
          type="info"
          show-icon
        />
        <el-input
          v-model="form.tokensText"
          :rows="3"
          type="textarea"
          placeholder="目標 FCM Token（可多個；一行一個）。若留空會用上方取得的 token。"
        />
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitForm">確定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { onMessage, getMessaging, isSupported } from "firebase/messaging";
import { initWebPushAndGetToken } from "@/lib/firebase";
import { sendNow, scheduleCreate } from "@/api/push";

// ===== FCM 狀態 =====
const supported = ref(false);
const permission = ref(Notification?.permission || "default");
const token = ref("");
const registration = ref(null);
const enabling = ref(false);
const supportText = computed(() => (supported.value ? "支援" : "不支援"));

onMounted(async () => {
  supported.value = await isSupported().catch(() => false);

  if (supported.value && Notification.permission === "granted") {
    const { token: t, registration: r } = await initWebPushAndGetToken();
    token.value = t || "";
    registration.value = r || null;
  }

  if (supported.value) {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      const title = payload?.notification?.title || payload?.data?.title || "前景訊息";
      const message =
        payload?.notification?.body || payload?.data?.body || JSON.stringify(payload);
      ElNotification({ title, message });
    });
  }

  reloadLocalJobs();
});

// ===== 推播列表（前端展示；排程結果會自動更新） =====
const pushList = ref([]);

function reloadLocalJobs() {
  // Demo：列表維護本地狀態 + 新送出的回饋；
  // 真正的排程送出與狀態更新由 Netlify Functions + Firestore 管
  pushList.value = [...pushList.value];
}

const enableNotification = async () => {
  if (!supported.value) return ElMessage.warning("此瀏覽器不支援 Web 推播");
  enabling.value = true;
  const {
    supported: sup,
    permission: perm,
    token: t,
    registration: r,
  } = await initWebPushAndGetToken();
  enabling.value = false;
  supported.value = sup;
  permission.value = perm;
  registration.value = r || null;
  if (perm !== "granted") return ElMessage.error("使用者未授權通知");
  token.value = t || "";
  t ? ElMessage.success("已取得 FCM Token") : ElMessage.error("取得 Token 失敗");
};
const refreshToken = async () => {
  await enableNotification();
};
const copyToken = async () => {
  if (!token.value) return;
  await navigator.clipboard.writeText(token.value);
  ElMessage.success("已複製 Token");
};
const showLocalNotification = async () => {
  if (!registration.value) return ElMessage.warning("尚未註冊 Service Worker");
  await registration.value.showNotification("本機通知測試", {
    body: "這是 showNotification 本機測試，不經 FCM",
    icon: "/favicon.ico",
    data: { url: "/" },
  });
  ElMessage.success("已發出本機通知");
};
const showElMessage = () => {
  ElNotification({ title: "模擬前景訊息", message: "這是 onMessage 畫面顯示示範" });
};

// ===== Dialog 與表單 =====
const dialogVisible = ref(false);
const isEditing = ref(false);
const editingIndex = ref(-1);
const saving = ref(false);
const form = ref({
  title: "",
  body: "",
  link: "/",
  mode: "now", // 'now' | 'later'
  sendAt: null, // Date
  tokensText: "",
});

function openCreateDialog() {
  isEditing.value = false;
  editingIndex.value = -1;
  form.value = {
    title: "",
    body: "",
    link: "/",
    mode: "now",
    sendAt: null,
    tokensText: token.value || "",
  };
  dialogVisible.value = true;
}

function openEditDialog(row) {
  isEditing.value = true;
  editingIndex.value = pushList.value.findIndex((r) => r === row);
  form.value = {
    title: row.title,
    body: row.body,
    link: row.link || "/",
    mode: row.mode,
    sendAt: row.sendAt ? new Date(row.sendAt) : null,
    tokensText: token.value || "",
  };
  dialogVisible.value = true;
}

function parseTokens(text) {
  return (text || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function randomId() {
  return Math.random().toString(36).slice(2, 8);
}

function formatDateTime(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

async function submitForm() {
  if (!form.value.title || !form.value.body) {
    ElMessage.warning("請填寫標題與內容");
    return;
  }
  const tokens = parseTokens(form.value.tokensText || token.value);
  if (!tokens.length) {
    ElMessage.warning("沒有可用的 Token");
    return;
  }

  saving.value = true;
  try {
    if (form.value.mode === "now") {
      // === 立即發送：呼叫 Netlify Functions push-now ===
      const res = await sendNow({
        tokens,
        title: form.value.title,
        body: form.value.body,
        link: form.value.link || "/",
      });
      pushList.value.unshift({
        id: randomId(),
        title: form.value.title,
        body: form.value.body,
        link: form.value.link || "/",
        mode: "now",
        sendAt: null,
        sendAtText: "",
        status: res.ok ? "成功" : "error",
      });
      res.ok ? ElMessage.success("已送出") : ElMessage.error("送出失敗");
    } else {
      // === 排程發送：呼叫 Netlify Functions schedule-create，寫入 Firestore ===
      if (!form.value.sendAt) {
        ElMessage.warning("請選擇發送時間");
        saving.value = false;
        return;
      }
      const res = await scheduleCreate({
        tokens,
        title: form.value.title,
        body: form.value.body,
        link: form.value.link || "/",
        sendAt: form.value.sendAt.getTime(), // 毫秒
      });
      if (res.ok) {
        // 先把這筆顯示在列表（狀態 pending），Netlify 每分鐘會發送並更新到「成功」
        pushList.value.unshift({
          id: res.id.slice(0, 6),
          title: form.value.title,
          body: form.value.body,
          link: form.value.link || "/",
          mode: "later",
          sendAt: form.value.sendAt.getTime(),
          sendAtText: formatDateTime(form.value.sendAt.getTime()),
          status: "pending",
        });
        ElMessage.success("已建立排程（每分鐘執行檢查）");
      } else {
        ElMessage.error("排程建立失敗");
      }
    }
    dialogVisible.value = false;
  } catch (e) {
    ElMessage.error(String(e));
  } finally {
    saving.value = false;
  }
}

function removeLocal(row, idx) {
  // Demo：前端先移除或標記，真正的取消可另外實作一支 Function 更新 Firestore 狀態為 canceled
  ElMessageBox.confirm("確定要移除此筆嗎？", "提示")
    .then(() => {
      pushList.value.splice(idx, 1);
    })
    .catch(() => {});
}
</script>

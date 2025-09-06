<template>
  <div class="p-6 space-y-6">
    <!-- 上方工具列 -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold">Web 推播管理</h2>
      <el-button type="primary" @click="handleCreate">新增推播</el-button>
    </div>

    <!-- ===== 新增：Web 推播（瀏覽器）設定區 ===== -->
    <el-card shadow="never">
      <template #header>
        <b>瀏覽器通知狀態</b>
      </template>

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
            >
              啟用瀏覽器通知
            </el-button>

            <el-button :disabled="!supported" @click="refreshToken">
              重新取得 Token
            </el-button>

            <el-button :disabled="!token" @click="copyToken"> 複製 Token </el-button>
          </div>

          <el-input
            type="textarea"
            :rows="3"
            placeholder="FCM Token（成功啟用後會出現，可到 Firebase Console 指定此 Token 發送測試推播）"
            v-model="token"
            readonly
          />
        </div>

        <div class="space-y-2">
          <div class="text-gray-600">前景推播測試（不經 FCM，純本機測試通知外觀）：</div>
          <div class="flex gap-2">
            <el-button @click="showLocalNotification" :disabled="!registration">
              顯示本機通知
            </el-button>
            <el-button type="success" @click="showElMessage">
              模擬前景訊息（onMessage）
            </el-button>
          </div>
          <el-alert
            title="要測 FCM 真實推播：請到 Firebase Console → Messaging → 新增通知 → 目標填『Web』→ 添加 Token（上方框）→ 發送"
            type="info"
            show-icon
          />
        </div>
      </div>
    </el-card>

    <!-- 推播列表（僅畫面示範） -->
    <el-table :data="pushList" border style="width: 100%">
      <!-- 編號 -->
      <el-table-column prop="id" label="編號" width="80" align="center" />

      <!-- 推播標題 -->
      <el-table-column prop="title" label="推播標題" min-width="200" />

      <!-- 狀態 -->
      <el-table-column label="狀態" width="150" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === '成功' ? 'success' : 'info'" effect="light">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            plain
            @click="handleEdit(scope.row)"
            :disabled="scope.row.status === '成功'"
          >
            編輯
          </el-button>
          <el-button
            size="small"
            type="danger"
            plain
            @click="handleDelete(scope.row)"
            :disabled="scope.row.status === '成功'"
          >
            刪除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
// === 新增：import 內容 ===
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElNotification } from "element-plus";
import { initWebPushAndGetToken } from "@/lib/firebase"; // 若無 @ 別名，改用相對路徑 ../../lib/firebase
import { onMessage, getMessaging, isSupported } from "firebase/messaging"; // 前景訊息監聽用

// 原本的假資料（保留）
const pushList = ref([]);

// === 新增：FCM 狀態 ===
const supported = ref(false);
const permission = ref(Notification?.permission || "default");
const token = ref("");
const registration = ref(null);
const enabling = ref(false);

const supportText = computed(() => (supported.value ? "支援" : "不支援"));

onMounted(async () => {
  supported.value = await isSupported().catch(() => false);

  // 若已授權，直接取 Token
  if (supported.value && Notification.permission === "granted") {
    const { token: t, registration: r } = await initWebPushAndGetToken();
    token.value = t || "";
    registration.value = r || null;
  }

  // 設定前景訊息監聽（頁面在前景、收到 FCM 時用）
  if (supported.value) {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      // 用 Element Plus 跳出提示示範
      const title = payload?.notification?.title || payload?.data?.title || "前景訊息";
      const message =
        payload?.notification?.body || payload?.data?.body || JSON.stringify(payload);
      ElNotification({
        title,
        message,
      });
    });
  }
});

// === 新增：行為 ===
const enableNotification = async () => {
  if (!supported.value) {
    ElMessage.warning("此瀏覽器不支援 Web 推播");
    return;
  }
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

  if (perm !== "granted") {
    ElMessage.error("使用者未授權通知或被封鎖（請在瀏覽器網址列右側檢查通知設定）");
    return;
  }
  token.value = t || "";
  if (t) {
    ElMessage.success("已取得 FCM Token");
  } else {
    ElMessage.error("取得 Token 失敗（請確認 .env 的 VITE_FIREBASE_VAPID_KEY）");
  }
};

const refreshToken = async () => {
  // 重新呼叫同一流程即可（Web 端通常回同一個 Token）
  await enableNotification();
};

const copyToken = async () => {
  if (!token.value) return;
  await navigator.clipboard.writeText(token.value);
  ElMessage.success("已複製 Token");
};

const showLocalNotification = async () => {
  // 不經 FCM 的本機通知（確認 SW 是否可顯示通知）
  if (!registration.value) {
    ElMessage.warning("尚未註冊 Service Worker");
    return;
  }
  await registration.value.showNotification("本機通知測試", {
    body: "這是 showNotification 本機測試，不經 FCM",
    icon: "/favicon.ico",
    data: { url: "/" },
  });
  ElMessage.success("已發出本機通知（若看不到，請檢查瀏覽器通知權限）");
};

const showElMessage = () => {
  // 模擬前景訊息（不走 FCM）
  ElNotification({
    title: "模擬前景訊息",
    message: "這是 onMessage 畫面顯示示範",
  });
};

// === 你原本的事件（保留） ===
const handleCreate = () => {
  console.log("新增推播");
};
const handleEdit = (row) => {
  console.log("編輯推播:", row);
};
const handleDelete = (row) => {
  console.log("刪除推播:", row);
};
</script>

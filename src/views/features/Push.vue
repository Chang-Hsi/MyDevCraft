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

    <!-- ===== 瀏覽器通知狀態（可收合） ===== -->
    <el-card shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <b class="select-none">瀏覽器通知狀態</b>
          <!-- 右上角收合按鈕 -->
          <el-button
            :icon="notifOpen ? ArrowUp : ArrowDown"
            text
            circle
            @click.stop="notifOpen = !notifOpen"
            :aria-label="notifOpen ? '收合' : '展開'"
          />
        </div>
      </template>

      <!-- 使用 Element Plus 的收合轉場 -->
      <el-collapse-transition>
        <div v-show="notifOpen">
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
              <div class="text-gray-600">
                前景推播測試（不經 FCM，純本機測試通知外觀）：
              </div>
              <div class="flex gap-2">
                <el-button @click="showLocalNotification" :disabled="!registration">
                  顯示本機通知
                </el-button>
                <el-button type="success" @click="showElMessage">
                  模擬前景訊息（onMessage）
                </el-button>
              </div>
              <el-alert
                title="正式推播由下方『新增推播』送到 Netlify Functions 代發；排程由 Netlify 的排程 Function 每分鐘執行。"
                type="info"
                show-icon
              />
            </div>
          </div>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- ===== 推播列表（從 Firestore 即時同步） ===== -->
    <el-card shadow="never" class="overflow-hidden">
      <template #header>
        <b>推播列表</b>
      </template>

      <el-table :data="pushList" stripe class="w-full">
        <el-table-column type="index" label="編號" width="70" align="center" />

        <el-table-column label="推播標題 / 內容" min-width="180">
          <template #default="{ row }">
            <div class="flex items-start gap-3 min-w-0">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100"
              >
                <span class="text-gray-500">✉️</span>
              </div>
              <div class="min-w-0">
                <div class="font-medium leading-5 truncate">
                  {{ row.title || "（未命名）" }}
                </div>
                <div class="text-xs text-gray-500 truncate">
                  {{ row.body || "—" }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="連結" min-width="320" show-overflow-tooltip>
          <template #default="{ row }">
            <a
              v-if="row.link"
              :href="row.link"
              target="_blank"
              class="text-blue-600 hover:underline"
            >
              {{ row.link }}
            </a>
            <span v-else class="text-gray-400">—</span>
          </template>
        </el-table-column>

        <el-table-column label="型態" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="light">
              {{ row.mode === "now" ? "立即" : "排程" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="預定時間" width="160" align="center">
          <template #default="{ row }">
            <span class="text-gray-700">{{ row.sendAtText || "—" }}</span>
          </template>
        </el-table-column>

        <el-table-column label="狀態" width="120" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.status === '成功' || row.status === 'sent'"
              type="success"
              effect="light"
              >成功</el-tag
            >
            <el-tag
              v-else-if="['scheduled', 'pending', 'processing'].includes(row.status)"
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

        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row, $index }">
            <el-button
              size="small"
              @click="openEditDialog(row)"
              :disabled="['成功', 'sent', 'processing'].includes(row.status)"
              >編輯</el-button
            >
            <el-button size="small" type="danger" plain @click="removeLocal(row, $index)">
              {{ ["pending", "processing"].includes(row.status) ? "取消" : "刪除" }}
            </el-button>
          </template>
        </el-table-column>

        <template #empty>
          <div class="py-16 text-gray-400">目前沒有推播</div>
        </template>
      </el-table>
    </el-card>

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
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import { onMessage, getMessaging, isSupported } from "firebase/messaging";
import { initWebPushAndGetToken } from "@/lib/firebase";
import { sendNow, scheduleCreate } from "@/api/push";

// Firestore
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// 新增：卡片展開狀態（預設收合）
const notifOpen = ref(false);

/* ===== FCM 狀態 ===== */
const supported = ref(false);
const permission = ref(Notification?.permission || "default");
const token = ref("");
const registration = ref(null);
const enabling = ref(false);
const supportText = computed(() => (supported.value ? "支援" : "不支援"));

/* ===== 列表（Firestore 即時訂閱） ===== */
const pushList = ref([]);
const jobsCol = collection(db, "pushJobs");
let unsub = null;

function formatDateTime(ms) {
  const d = new Date(ms);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}`;
}

function reloadLocalJobs() {
  ElMessage.success("已與雲端同步");
}

/* ===== onMounted：FCM + Firestore 訂閱 ===== */
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

  // Firestore 即時訂閱
  const q = query(jobsCol, orderBy("createdAt", "desc"));
  unsub = onSnapshot(q, (snap) => {
    pushList.value = snap.docs.map((d) => {
      const x = d.data();
      return {
        id: d.id,
        title: x.title || "",
        body: x.body || "",
        link: x.link || "/",
        mode: x.mode || (x.sendAt ? "later" : "now"),
        sendAt: x.sendAt ?? null,
        sendAtText: x.sendAt ? formatDateTime(x.sendAt) : "",
        status: x.status || "—",
      };
    });
  });
});

onBeforeUnmount(() => {
  if (unsub) unsub();
});

/* ===== Dialog 與表單 ===== */
const dialogVisible = ref(false);
const isEditing = ref(false);
const editingIndex = ref(-1);
const saving = ref(false);
const form = ref({
  title: "",
  body: "",
  link: "/",
  mode: "now",
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

async function openEditDialog(row) {
  isEditing.value = true;
  editingIndex.value = pushList.value.findIndex((r) => r.id === row.id);

  // 取回該筆的完整資料（含 tokens）
  const snap = await getDoc(doc(db, "pushJobs", row.id));
  const data = snap.exists() ? snap.data() : {};

  form.value = {
    title: row.title,
    body: row.body,
    link: row.link || "/",
    mode: row.mode,
    sendAt: row.sendAt ? new Date(row.sendAt) : null,
    tokensText: Array.isArray(data.tokens) ? data.tokens.join("\n") : token.value || "",
  };
  dialogVisible.value = true;
}

function parseTokens(text) {
  return (text || "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ===== FCM 動作 ===== */
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

/* ===== 送出（新增/編輯） ===== */
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
    // 編輯（只允許 pending/canceled/草稿 之類，這裡簡化：不是 sent/processing 就可編）
    if (isEditing.value) {
      const row = pushList.value[editingIndex.value];
      if (!row) {
        ElMessage.error("找不到要編輯的資料");
        saving.value = false;
        return;
      }
      if (["sent", "成功", "processing"].includes(row.status)) {
        ElMessage.warning("此狀態不可編輯");
        saving.value = false;
        return;
      }
      await updateDoc(doc(db, "pushJobs", row.id), {
        title: form.value.title,
        body: form.value.body,
        link: form.value.link || "/",
        tokens,
        sendAt: form.value.mode === "later" ? form.value.sendAt?.getTime() ?? null : null,
        mode: form.value.mode,
        updatedAt: serverTimestamp(),
      });
      ElMessage.success("已更新");
      dialogVisible.value = false;
      saving.value = false;
      return;
    }

    // 新增
    if (form.value.mode === "now") {
      // 立即推播（Functions）
      const res = await sendNow({
        tokens,
        title: form.value.title,
        body: form.value.body,
        link: form.value.link || "/",
      });

      // 成功則把紀錄寫入 Firestore（給列表用）
      if (res?.ok) {
        await addDoc(jobsCol, {
          tokens,
          title: form.value.title,
          body: form.value.body,
          link: form.value.link || "/",
          sendAt: null,
          mode: "now",
          status: "sent",
          resultSummary: res.result
            ? {
                successCount: res.result.successCount ?? 0,
                failureCount: res.result.failureCount ?? 0,
              }
            : null,
          createdAt: serverTimestamp(),
          sentAt: serverTimestamp(),
        });
        ElMessage.success("已送出");
      } else {
        ElMessage.error("送出失敗");
      }
    } else {
      // 排程推播（Functions 會把 doc 寫入 Firestore）
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
        sendAt: form.value.sendAt.getTime(),
      });
      if (res?.ok) {
        ElMessage.success("已建立排程");
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

/* ===== 刪除/取消 ===== */
function removeLocal(row) {
  ElMessageBox.confirm(
    ["pending", "processing"].includes(row.status)
      ? "確定要取消這筆排程嗎？"
      : "確定要刪除此筆紀錄嗎？",
    "提示"
  )
    .then(async () => {
      if (["pending", "processing"].includes(row.status)) {
        await updateDoc(doc(db, "pushJobs", row.id), {
          status: "canceled",
          canceledAt: serverTimestamp(),
        });
        ElMessage.success("已取消");
      } else {
        // 保守作法：標記為取消。若要真的刪除可改成 deleteDoc(...)
        await updateDoc(doc(db, "pushJobs", row.id), {
          status: "canceled",
          canceledAt: serverTimestamp(),
        });
        ElMessage.success("已標記為取消");
      }
    })
    .catch(() => {});
}
</script>

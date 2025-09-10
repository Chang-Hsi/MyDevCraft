<!-- 活動編輯頁 -->
<template>
  <div class="p-4 space-y-4">
    <!-- ===== 頂部 Steps（原樣） ===== -->
    <el-card shadow="never" class="!border-0">
      <div class="flex justify-center">
        <el-steps class="my-2 w-[50vw]" :active="step" simple>
          <el-step title="Step 1 基本資料" :icon="Edit" />
          <el-step title="Step 2 活動說明" :icon="UploadFilled" />
          <el-step title="Step 3 預覽送出" :icon="Picture" />
        </el-steps>
      </div>
    </el-card>

    <!-- ===== Step 1：基本資料（整段重做樣式） ===== -->
    <el-card v-show="step === 0" shadow="never" class="!border-0">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :validate-on-rule-change="false"
        label-width="0"
        class="w-[50vw] mx-auto space-y-3"
      >
        <!-- 調整：粉色大標題條（對應圖片「活動名稱」） -->
        <el-form-item prop="title">
          <div class="w-full rounded-xl bg-white border border-gray-300 p-3">
            <input
              v-model="form.title"
              type="text"
              class="w-full bg-transparent outline-none text-2xl md:text-3xl font-bold"
              placeholder="活動名稱"
            />
          </div>
        </el-form-item>

        <!-- 開始 / 結束（左），時區卡（右） -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- 左側：把開始/結束合在同一張卡，左為時間軸、右為兩行選擇器 -->
          <div class="md:col-span-2 rounded-xl bg-gray-50 p-3">
            <div class="grid grid-cols-[84px_1fr] gap-3 items-start">
              <!-- 左半：時間軸（純樣式） -->
              <div class="pt-1">
                <div class="flex items-center gap-2 h-5">
                  <span class="inline-block h-2.5 w-2.5 rounded-full bg-gray-400"></span>
                  <span class="text-gray-600">開始</span>
                </div>
                <div
                  class="ml-[5px] my-1 h-6 border-l border-dashed border-gray-300"
                ></div>
                <div class="flex items-center gap-2 h-5">
                  <span
                    class="inline-block h-2.5 w-2.5 rounded-full border border-gray-400 bg-white"
                  ></span>
                  <span class="text-gray-600">結束</span>
                </div>
              </div>

              <!-- 右半：兩行 日期＋時間（各自對應開始/結束），仍包在 el-form-item 裡以保留驗證 -->
              <div class="space-y-3">
                <!-- 開始 -->
                <el-form-item prop="startAt" class="!mb-4">
                  <div class="flex w-full items-center gap-3">
                    <!-- 日期 -->
                    <el-date-picker
                      v-model="startDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="選擇日期"
                      style="width: 300px"
                      :validate-event="false"
                    />
                    <!-- 時間 -->
                    <el-time-select
                      v-model="startTime"
                      start="00:00"
                      step="00:15"
                      end="23:45"
                      placeholder="選擇時間"
                      :validate-event="false"
                    />
                  </div>
                </el-form-item>

                <!-- 結束 -->
                <el-form-item prop="endAt" class="!mb-0">
                  <div class="flex w-full items-center gap-3">
                    <el-date-picker
                      v-model="endDate"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="選擇日期"
                      style="width: 300px"
                      :validate-event="false"
                    />
                    <el-time-select
                      v-model="endTime"
                      start="00:00"
                      step="00:15"
                      end="23:45"
                      placeholder="選擇時間"
                      :validate-event="false"
                    />
                  </div>
                </el-form-item>
              </div>
            </div>
          </div>

          <!-- 右側：時區卡（保持原樣，不用改） -->
          <div class="rounded-xl bg-gray-50 p-3 flex items-start gap-3">
            <el-icon class="text-gray-400"><Location /></el-icon>
            <div class="leading-tight">
              <div class="text-sm text-gray-600">{{ tzText }}</div>
              <div class="text-sm text-gray-500">台北</div>
            </div>
          </div>
        </div>

        <!-- 報名截止（錯誤訊息顯示在日期欄位下方） -->
        <el-form-item class="!mb-0">
          <!-- 調整：items-start 讓內層有錯誤提示時能往下推，不會擠壓到右邊時間欄 -->
          <div class="flex w-[705px] items-start gap-3 rounded-xl bg-gray-50 p-3">
            <el-icon class="text-gray-400"><Calendar /></el-icon>
            <div class="w-14 shrink-0 text-gray-500">截止</div>

            <!-- 將 prop 放在「日期」的內層 el-form-item 上，錯誤訊息會顯示在此欄位下 -->
            <el-form-item prop="signupDeadline" label-width="0" class="!mb-0">
              <el-date-picker
                v-model="deadlineDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="選擇日期"
                style="width: 200px"
                :validate-event="false"
              />
            </el-form-item>

            <!-- 時間欄位不綁定 prop，就不會顯示錯誤訊息 -->
            <el-form-item label-width="0" class="!mb-0">
              <el-time-select
                v-model="deadlineTime"
                start="00:00"
                step="00:15"
                end="23:45"
                placeholder="選擇時間"
                style="width: 375px"
                :validate-event="false"
              />
            </el-form-item>
          </div>
        </el-form-item>

        <!-- 調整：新增活動地點（點擊展開輸入） -->
        <div class="space-y-3">
          <div
            v-if="!showLocation"
            class="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-3 hover:bg-gray-100"
            @click="showLocation = true"
          >
            <div class="flex items-center gap-3">
              <el-icon class="text-gray-400"><Place /></el-icon>
              <div>
                <div class="font-medium">新增活動地點</div>
                <div class="text-sm text-gray-500">線下地點或線上連結</div>
              </div>
            </div>
            <el-icon class="text-gray-400"><Plus /></el-icon>
          </div>
          <div v-else class="rounded-xl bg-gray-50 p-3">
            <div class="mb-2 flex items-center gap-2">
              <el-icon class="text-gray-400"><Place /></el-icon>
              <div class="font-medium">活動地點</div>
            </div>
            <el-input v-model="form.location" placeholder="輸入地址或線上連結" />
          </div>

          <!-- 調整：新增描述（點擊展開） -->
          <div
            v-if="!showDesc"
            class="flex cursor-pointer items-center justify-between rounded-xl bg-gray-50 p-3 hover:bg-gray-100"
            @click="showDesc = true"
          >
            <div class="flex items-center gap-3">
              <el-icon class="text-gray-400"><Document /></el-icon>
              <div class="font-medium">新增描述</div>
            </div>
            <el-icon class="text-gray-400"><Plus /></el-icon>
          </div>
          <div v-else class="rounded-xl bg-gray-50 p-3">
            <div class="mb-2 flex items-center gap-2">
              <el-icon class="text-gray-400"><Document /></el-icon>
              <div class="font-medium">描述</div>
            </div>
            <el-input
              v-model="form.desc"
              type="textarea"
              :rows="3"
              placeholder="簡短描述（詳細內容在 Step 2 編輯）"
            />
          </div>
        </div>

        <!-- 調整：活動選項 -->
        <div class="rounded-xl bg-gray-50 p-1">
          <el-divider class="!my-0" />
          <!-- 需要審核 -->
          <div class="flex items-center justify-between p-3">
            <div class="flex items-center gap-3">
              <el-icon class="text-gray-400"><Finished /></el-icon>
              <div>需要審核</div>
            </div>
            <el-switch size="large" v-model="form.needApproval" />
          </div>
          <el-divider class="!my-0" />
          <!-- 人數限制 -->
          <div class="flex items-center justify-between p-3">
            <div class="flex items-center gap-3">
              <el-icon class="text-gray-400"><User /></el-icon>
              <div>人數限制</div>
            </div>
            <div class="flex items-center gap-2">
              <el-input-number
                v-model="form.participants"
                :min="1"
                :max="100000"
                :controls="false"
                class="!w-28"
                :validate-event="false"
              />
            </div>
          </div>
        </div>

        <!-- 建立人（保留需求，樣式融入卡片） -->
        <el-form-item prop="creator" class="!mb-0">
          <div class="rounded-xl bg-gray-50 p-3 w-full">
            <div class="mb-2 text-gray-500">建立人</div>
            <el-input v-model="form.creator" show-word-limit :validate-event="false" />
          </div>
        </el-form-item>

        <!-- 活動封面（保留需求） -->
        <el-form-item>
          <div class="rounded-xl bg-gray-50 p-3 w-full">
            <div class="mb-2 text-gray-500">活動封面</div>

            <div class="space-y-3">
              <!-- 調整：使用 drag，上傳清單隱藏，機制不變（auto-upload=false，走 on-change） -->
              <el-upload
                class="cover-uploader w-full"
                drag
                :auto-upload="false"
                :limit="1"
                :file-list="fileList"
                :show-file-list="false"
                accept="image/*"
                :on-change="handleCoverChange"
                :on-remove="handleCoverRemove"
              >
                <!-- 中央圖示 + 文案 -->
                <div class="upload-dragger-custom">
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="u-title">
                    拖曳圖片到此或 <span class="u-link">點擊上傳</span>
                  </div>
                  <div class="u-sub">支援 JPG/PNG，建議 1200×800 以上</div>
                </div>
              </el-upload>

              <!-- 已選檔案：顯示檔名 + 操作（預覽 / 移除） -->
              <div
                v-if="form.cover"
                class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <div class="flex items-center gap-2">
                  <el-icon class="text-gray-400"><Picture /></el-icon>
                  <!-- 點檔名即可預覽 -->
                  <button
                    type="button"
                    class="underline text-gray-700 hover:opacity-80"
                    @click="handlePreview"
                  >
                    {{ coverName || "已上傳圖片" }}
                  </button>
                  <span v-if="coverSizeKB" class="text-xs text-gray-400"
                    >（{{ coverSizeKB }} KB）</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <el-button @click="handleCoverRemove" style="border: 0px">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M7 21q-.825 0-1.412-.587T5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413T17 21zm2-4h2V8H9zm4 0h2V8h-2z"
                      />
                    </svg>
                  </el-button>
                </div>
              </div>

              <!-- 全螢幕預覽（Element Plus） -->
              <ElImageViewer
                v-if="previewVisible"
                :url-list="[form.cover]"
                @close="previewVisible = false"
              />
            </div>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- ===== Step 2：內容編輯（原樣） ===== -->
    <el-card v-show="step === 1" shadow="never">
      <div class="w-[50vw] mx-auto">
        <div class="flex items-center gap-2 mb-3">
          <el-button @click="saveNow" :loading="saving">手動儲存</el-button>
          <span class="text-gray-500">大小：約 {{ sizeKB }} KB（打字後 1 秒自動存）</span>
        </div>
        <!-- 外層容器，僅為了套樣式 -->
        <div class="editor-wrap">
          <ckeditor :editor="Editor" v-model="content" @ready="onReady" />
        </div>
      </div>
    </el-card>

    <!-- ===== Step 3：預覽（原樣） ===== -->
    <el-card v-show="step === 2" shadow="never">
      <div class="w-[50vw] mx-auto space-y-4">
        <div class="flex gap-4 items-start">
          <img
            v-if="form.cover"
            :src="form.cover"
            class="w-56 h-36 object-cover rounded border"
            alt="cover"
          />
          <div class="flex-1">
            <h2 class="text-2xl font-bold">{{ form.title }}</h2>
            <p class="text-gray-600">建立人：{{ form.creator }}</p>
            <p class="text-gray-600">報名截止：{{ form.signupDeadline }}</p>
            <p class="text-gray-600">時間：{{ form.startAt }} ~ {{ form.endAt }}</p>
            <p class="text-gray-600">
              人數上限：{{ limitMode === "unlimited" ? "無限制" : form.participants }}
            </p>
          </div>
        </div>
        <el-divider />
        <div class="prose max-w-none" v-html="content"></div>
      </div>
    </el-card>

    <!-- ===== 底部操作（原樣） ===== -->
    <div class="flex justify-between items-center">
      <div>
        <el-button v-if="step > 0" @click="prev">上一步</el-button>
      </div>
      <div class="space-x-2">
        <el-button v-if="step < 2" type="primary" @click="next">下一步</el-button>
        <el-button v-else type="success" @click="submit">確定更新</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
/* ===== 原有 import，補上本段使用到的圖示 ===== */
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Plus,
  Edit,
  UploadFilled,
  Picture,
  Clock,
  Calendar,
  Location,
  Place,
  Document,
  Ticket,
  Finished,
  User,
} from "@element-plus/icons-vue";
import { ElImageViewer } from "element-plus";
import { useEventsStore } from "@/stores/events";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { get, set, del } from "idb-keyval";

const router = useRouter();
const route = useRoute();
const events = useEventsStore();
const step = ref(0);

/* ===== 原本表單 + 新增欄位 ===== */
const formRef = ref();
const form = reactive({
  cover: "",
  title: "",
  creator: "",
  signupDeadline: "",
  startAt: "",
  endAt: "",
  participants: 50,
  location: "",
  desc: "",
  ticketType: "free",
  ticketPrice: 0,
  needApproval: false,
});
const fileList = ref([]);

/* ===== Date/Time 拆分以符合圖片 UI（會自動組回原欄位） ===== */
const startDate = ref("");
const startTime = ref("");
const endDate = ref("");
const endTime = ref("");
const deadlineDate = ref("");
const deadlineTime = ref("");

function joinDT(dateStr, timeStr) {
  if (!dateStr || !timeStr) return "";
  return `${dateStr} ${timeStr}`; // 與 rules 的 value-format 對齊
}
function splitDT(str) {
  if (!str) return { d: "", t: "" };
  const [d, t = ""] = String(str).trim().split(" ");
  return { d: d || "", t: t.slice(0, 5) }; // HH:mm
}

/* 同步組合回原欄位供驗證/送出 */
watch(
  [startDate, startTime],
  () => (form.startAt = joinDT(startDate.value, startTime.value))
);
watch([endDate, endTime], () => (form.endAt = joinDT(endDate.value, endTime.value)));
watch(
  [deadlineDate, deadlineTime],
  () => (form.signupDeadline = joinDT(deadlineDate.value, deadlineTime.value))
);

/* 友善顯示（像圖片的「9月10日 週三 下午 02:00」） */
function toFriendly(dt) {
  if (!dt) return "";
  const d = new Date(dt.replace(" ", "T"));
  const opt = {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  // zh-TW 顯示「9月10日 週三 下午 02:00」
  return new Intl.DateTimeFormat("zh-TW", opt).format(d);
}

/* 時區顯示（右卡） */
const tzText = computed(() => {
  const offMin = -new Date().getTimezoneOffset(); // e.g. +480
  const sign = offMin >= 0 ? "+" : "-";
  const hh = String(Math.floor(Math.abs(offMin) / 60)).padStart(2, "0");
  const mm = String(Math.abs(offMin) % 60).padStart(2, "0");
  return `GMT${sign}${hh}:${mm}`;
});

/* UI 控制：地點/描述展開 */
const showLocation = ref(false);
const showDesc = ref(false);

/* 人數限制模式（對應圖片「無限制 / 限制」） */
const limitMode = ref("limited"); // 預設沿用原本 participants（有限制）
watch(limitMode, (m) => {
  if (m === "unlimited") form.participants = 0;
  if (m === "limited" && !form.participants) form.participants = 50;
});

/* ===== 驗證規則（沿用 + 小調整） ===== */
const rules = {
  title: [{ required: true, message: "請輸入活動名稱", trigger: "blur" }],
  creator: [{ required: true, message: "請輸入建立人", trigger: "blur" }],
  signupDeadline: [{ required: true, message: "請選擇報名截止", trigger: "change" }],
  startAt: [
    { required: true, message: "請選擇開始時間", trigger: "change" },
    {
      validator: (_, v, cb) => {
        if (!v || !form.signupDeadline) return cb();
        if (toDate(v) < toDate(form.signupDeadline))
          return cb(new Error("開始時間不可早於報名截止"));
        cb();
      },
      trigger: "change",
    },
  ],
  endAt: [
    { required: true, message: "請選擇結束時間", trigger: "change" },
    {
      validator: (_, v, cb) => {
        if (!v || !form.startAt) return cb();
        if (toDate(v) < toDate(form.startAt))
          return cb(new Error("結束時間不可早於開始時間"));
        cb();
      },
      trigger: "change",
    },
  ],
  participants: [
    {
      validator: (_, v, cb) => {
        if (limitMode.value === "unlimited") return cb();
        if (!v || v < 1) return cb(new Error("請輸入人數"));
        cb();
      },
      trigger: "change",
    },
  ],
};

function toDate(s) {
  return new Date(String(s).replace(" ", "T"));
}

// === 新增：檔名、大小、預覽視窗狀態 ===

const coverName = ref(""); // 顯示用檔名
const coverSizeKB = ref(0); // 顯示用大小（KB）
const previewVisible = ref(false); // 控制 ImageViewer 顯示

function handlePreview() {
  if (form.cover) previewVisible.value = true;
}

// === 調整：在原本的 handleCoverChange 裡補記錄檔名與大小 ===
function handleCoverChange(file, fl) {
  fileList.value = fl.slice(-1);

  // 記錄檔名與大小（顯示於檔名列）
  coverName.value = file.name || "";
  coverSizeKB.value = file.size ? Math.ceil(file.size / 1024) : 0;

  const reader = new FileReader();
  reader.onload = () => (form.cover = String(reader.result || ""));
  reader.readAsDataURL(file.raw);
}

// === 調整：移除時也把檔名/大小清掉 ===
function handleCoverRemove() {
  fileList.value = [];
  form.cover = "";
  coverName.value = "";
  coverSizeKB.value = 0;
}

/* ===== CKEditor（原樣） ===== */
const Editor = ClassicEditor;
const editorInstance = ref(null);
const content = ref("");
function onReady(editor) {
  editorInstance.value = editor;
}

// 取得要編輯的 id
const editingId = computed(() => Number(route.params.id || 0));

const DB_KEY = `ckdoc:${route.fullPath || "events:new"}`;
const saving = ref(false);

onMounted(async () => {
  // 從 pinia 取得要編輯的資料
  let ev = events.byId(editingId.value);

  // 若第一次拿不到（理論上不會，但保險），等 list 準備好
  if (!ev) {
    const stop = watch(
      () => events.list,
      () => {
        ev = events.byId(editingId.value);
        if (ev) {
          stop();
          hydrate(ev);
        }
      },
      { deep: true, immediate: true }
    );
  } else {
    hydrate(ev);
  }

  // 讀 CKEditor 草稿（若有則覆蓋內容）
  const cached = await get(DB_KEY.value);
  if (typeof cached === "string" && cached.length) content.value = cached;
});

// 把資料灌入到畫面
function hydrate(ev) {
  // 表單本體
  Object.assign(form, {
    cover: ev.cover || "",
    title: ev.title || "",
    creator: ev.creator || "",
    signupDeadline: ev.signupDeadline || "",
    startAt: ev.startAt || "",
    endAt: ev.endAt || "",
    participants: ev.participants ?? 50,
    location: ev.location || "",
    desc: ev.desc || "",
    ticketType: ev.ticketType || "free",
    ticketPrice: ev.ticketPrice || 0,
    needApproval: !!ev.needApproval,
  });

  // 把字串時間拆回「日期/時間」兩格
  const s = splitDT(form.startAt);
  startDate.value = s.d;
  startTime.value = s.t;
  const e = splitDT(form.endAt);
  endDate.value = e.d;
  endTime.value = e.t;
  const d = splitDT(form.signupDeadline);
  deadlineDate.value = d.d;
  deadlineTime.value = d.t;

  // 封面檔名顯示（若是 dataURL 沒有檔名就用預設）
  if (form.cover) {
    coverName.value = "已上傳圖片";
    coverSizeKB.value = 0;
  }

  // 內容（若沒有草稿，就先帶原始內容）
  if (!content.value) content.value = ev.content || "";

  // 清掉可能的殘留驗證
  nextTick(() => formRef.value?.clearValidate());
}

const sizeKB = computed(() => Math.ceil(new Blob([content.value || ""]).size / 1024));
let timer = null;
watch(
  content,
  (val) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      saving.value = true;
      try {
        await set(DB_KEY, val || "");
      } finally {
        saving.value = false;
      }
    }, 1000);
  },
  { flush: "post" }
);
async function saveNow() {
  saving.value = true;
  try {
    await set(DB_KEY, content.value || "");
  } finally {
    saving.value = false;
  }
}

/* ===== 導覽控制（原樣） ===== */
function prev() {
  step.value = Math.max(0, step.value - 1);
}
function next() {
  if (step.value === 0) {
    formRef.value.validate((ok) => {
      if (ok) step.value = 1;
    });
    return;
  }
  if (step.value === 1) {
    const plain = String(content.value)
      .replace(/<[^>]*>/g, "")
      .trim();
    if (!plain) {
      ElMessage.warning("請先編輯活動說明內容");
      return;
    }
    step.value = 2;
    return;
  }
}

function deriveStatus(startAt, endAt) {
  const now = new Date();
  const s = toDate(startAt);
  const e = toDate(endAt);
  if (now < s) return "尚未開始";
  if (now > e) return "已結束";
  return "進行中";
}

async function submit() {
  const payload = {
    title: form.title,
    creator: form.creator,
    startAt: form.startAt,
    endAt: form.endAt,
    status: deriveStatus(form.startAt, form.endAt),
    participants: form.participants,
    content: content.value || "",
    cover: form.cover || "",
    signupDeadline: form.signupDeadline,
    location: form.location,
    desc: form.desc,
    ticketType: form.ticketType,
    ticketPrice: form.ticketType === "paid" ? form.ticketPrice : 0,
    needApproval: form.needApproval,
  };
  events.update(editingId.value, payload); // ← 這裡改用 update
  await del(DB_KEY); // 清掉該篇的編輯草稿
  ElMessage.success("已更新");
  router.push("/examples/events");
}

function cancel() {
  router.back();
}
</script>

<style scoped>
/* 讓 Step 2 預覽圖片不超出 */
.prose :deep(img) {
  max-width: 100%;
}

/* CKEditor 輸入區最小高度 */
.editor-wrap :deep(.ck-editor__editable_inline) {
  min-height: 660px; /* 想要多一點就改數字 */
}
</style>

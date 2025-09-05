<template>
  <div class="space-y-4">
    <el-tabs v-model="tab">
      <!-- 後台 -->
      <el-tab-pane label="後台展示畫面" name="admin">
        <div
          class="flex items-center justify-between mb-3 sticky top-0 z-10 bg-white/70 backdrop-blur p-2 rounded"
        >
          <div class="text-gray-500">共 {{ banners.length }} 筆</div>
          <div class="flex gap-2">
            <el-button type="primary" @click="openCreate">新增 Banner</el-button>
            <el-button :loading="loading" @click="reload">重新整理</el-button>
          </div>
        </div>

        <el-table :data="banners" v-loading="loading" row-key="id" style="width: 100%">
          <el-table-column type="index" label="#" width="80" fixed="left" />
          <el-table-column
            prop="name"
            label="Banner 名"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column label="狀態" width="150" align="center">
            <template #default="{ row }">
              <el-switch
                :model-value="row.enabled === true"
                active-text="啟用"
                inactive-text="停用"
                inline-prompt
                :loading="switchBusyId === row.id"
                @change="(val) => onToggleEnabled(row, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="180">
            <template #default="{ row }">
              <el-tooltip content="編輯" placement="top">
                <el-button size="small" @click="openEdit(row)" :icon="Edit" />
              </el-tooltip>
              <el-popconfirm
                width="220"
                :title="`確定刪除「${row.name}」？`"
                confirm-button-text="刪除"
                cancel-button-text="取消"
                @confirm="removeRow(row)"
              >
                <template #reference>
                  <el-button type="danger" size="small" :icon="Delete" />
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 前台 -->
      <el-tab-pane label="前台展示畫面" name="site">
        <!-- 頂部 Banner（你原本的） -->
        <div class="max-w-4xl mx-auto bg-white" v-loading="siteLoading">
          <template v-if="siteActiveBanner">
            <el-carousel
              v-if="siteActiveBanner.images && siteActiveBanner.images.length"
              height="360px"
              :interval="3000"
              indicator-position="outside"
              arrow="hover"
              autoplay
            >
              <el-carousel-item
                v-for="(img, i) in siteActiveBanner.images"
                :key="i"
                class="bg-gray-50"
              >
                <el-image
                  :src="cdn(img, 'f_auto,q_auto,w_1280')"
                  fit="cover"
                  class="w-full h-full"
                />
              </el-carousel-item>
            </el-carousel>

            <el-empty v-else description="此 Banner 尚未上傳任何圖片" />
          </template>

          <el-empty v-else description="尚未啟用任何 Banner" />
        </div>

        <!-- 輪播圖下方的畫面 -->
        <div class="max-w-4xl mx-auto bg-white py-1 px-4">
          <!-- 服務特色 / 產品亮點 -->
          <section class="px-4 md:px-0 mt-10">
            <h3 class="text-2xl font-bold mb-4">我們的服務特色</h3>
            <p class="text-gray-500 mb-6">以簡潔、可落地的方案快速解決你的需求。</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div
                v-for="(f, i) in featureCards"
                :key="i"
                class="flex items-start gap-3 p-4 border border-gray-300 rounded-xl hover:shadow-sm transition"
              >
                <div
                  class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
                >
                  <el-icon class="text-gray-700 text-lg">
                    <component :is="f.icon" />
                  </el-icon>
                </div>
                <div>
                  <div class="font-semibold leading-tight">{{ f.title }}</div>
                  <div class="text-sm text-gray-500 leading-snug">{{ f.desc }}</div>
                </div>
              </div>
            </div>
          </section>

          <!-- 簡短介紹 -->
          <section class="px-4 md:px-0 mt-12">
            <h3 class="text-2xl font-bold mb-3">我們的理念</h3>
            <p class="text-gray-600 leading-relaxed">
              我們相信好的產品來自穩健的工程與貼近使用者的設計。專注核心、快速交付、持續優化，
              讓你的業務能以更低成本、更高品質地往前推進。
            </p>
          </section>

          <!-- ================= 底部區塊（補充 & 行動） ================= -->

          <!-- CTA -->
          <section class="px-4 md:px-0 mt-12">
            <div
              class="rounded-2xl border border-gray-300 p-6 md:p-8 bg-gray-50 text-center"
            >
              <h3 class="text-2xl font-bold mb-2">準備開始了嗎？</h3>
              <p class="text-gray-600 mb-5">
                告訴我們你的需求，我們將在 1–2 個工作天內回覆。
              </p>
              <div class="flex items-center justify-center gap-3">
                <el-button type="info" size="large" @click="onContact">
                  聯絡我們
                </el-button>
                <el-button size="large" @click="onLearnMore"> 了解更多 </el-button>
              </div>
            </div>
          </section>

          <!-- FAQ（2～3 題） -->
          <section class="px-4 md:px-0 mt-10">
            <h3 class="text-2xl font-bold mb-4">常見問題</h3>
            <el-collapse class="bg-white rounded-lg">
              <el-collapse-item
                v-for="(q, i) in faqList"
                :key="i"
                :title="q.q"
                :name="i + 1"
              >
                <div class="text-gray-600 leading-relaxed">{{ q.a }}</div>
              </el-collapse-item>
            </el-collapse>
          </section>

          <!-- Footer -->
          <footer class="mt-12 border-t pt-6 pb-10 text-sm text-gray-500">
            <div class="px-4 md:px-0 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div class="font-semibold text-gray-700 mb-1">夢市集軟體技術有限公司</div>
                <div>專注軟體客製 / App & 網站開發 / 教學與顧問</div>
              </div>
              <div>
                <div class="font-semibold text-gray-700 mb-1">聯絡方式</div>
                <div class="flex items-center gap-2">
                  <el-icon><Message /></el-icon>
                  <a href="mailto:hello@example.com" class="hover:underline"
                    >hello@example.com</a
                  >
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <el-icon><Phone /></el-icon>
                  <span>02-1234-5678</span>
                </div>
              </div>
              <div>
                <div class="font-semibold text-gray-700 mb-1">追蹤我們</div>
                <div class="flex items-center gap-3">
                  <el-link
                    href="https://www.facebook.com"
                    target="_blank"
                    :underline="false"
                  >
                    <el-icon><Link /></el-icon> Facebook
                  </el-link>
                  <el-link
                    href="https://www.linkedin.com"
                    target="_blank"
                    :underline="false"
                  >
                    <el-icon><Link /></el-icon> LinkedIn
                  </el-link>
                </div>
              </div>
            </div>
            <div class="text-center mt-6 text-xs text-gray-400">
              © {{ new Date().getFullYear() }} 夢市集軟體技術有限公司. All rights
              reserved.
            </div>
          </footer>
        </div>
      </el-tab-pane>

      <!-- 編輯器展示畫面 -->
      <el-tab-pane label="編輯器展示畫面" name="editor">
        <!-- 說明：這裡把 v-loading 換成 editorLoading，並加入 v-html 渲染 -->
        <div class="max-w-4xl mx-auto bg-white p-4" v-loading="editorLoading">
          <!-- 有內容就渲染，沒有就顯示空狀態 -->
          <div v-if="editorHtml" class="rich-html" v-html="editorHtml"></div>
          <el-empty v-else description="尚無已保存的文章" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 新增 / 編輯 Dialog -->
    <el-dialog
      :title="form.id ? '編輯 Banner' : '新增 Banner'"
      v-model="dialog.open"
      width="720px"
      @closed="resetForm"
    >
      <el-form :model="form" ref="formRef" label-width="90px">
        <el-form-item
          label="Banner 名"
          prop="name"
          :rules="[{ required: true, message: '請輸入名稱', trigger: 'blur' }]"
        >
          <el-input v-model="form.name" placeholder="例如：首頁主輪播" />
        </el-form-item>

        <el-form-item label="圖片上傳">
          <el-upload
            ref="uploadRef"
            list-type="picture-card"
            multiple
            :auto-upload="false"
            :file-list="fileList"
            @change="onFileChange"
            @remove="onRemoveFile"
            @preview="onPreviewFile"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="text-gray-400 text-xs mt-1">
                會上傳到 Cloudinary (unsigned preset)
              </div>
            </template>
          </el-upload>

          <el-dialog
            v-model="preview.open"
            width="800px"
            top="2vh"
            @closed="preview.url = ''"
          >
            <img v-if="preview.url" :src="preview.url" class="w-full rounded" />
          </el-dialog>
        </el-form-item>

        <el-alert
          v-if="uploading > 0"
          type="info"
          show-icon
          :title="`正在上傳…(${uploading})`"
          class="mb-2"
        />

        <el-form-item>
          <el-button @click="dialog.open = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="submit">確定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Link,
  Phone,
  Message,
  Setting,
  User,
  Timer,
  Plus,
  Edit,
  Delete,
} from "@element-plus/icons-vue";
import { db } from "@/lib/firebase.js";
import { uploadImageToCloudinary } from "@/lib/cloudinary.js";
import {
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  getDocs,
  where,
  limit,
} from "firebase/firestore";
import { get, keys } from "idb-keyval";

const editorLoading = ref(false);
const editorHtml = ref("");

// 與「編輯器頁」保存時使用的 key 規則保持一致
const EDITOR_DB_KEY = "ckdoc:/features/editor";

// 讀取 IndexedDB 內容
async function loadEditorHtml() {
  editorLoading.value = true;
  try {
    let html = await get(EDITOR_DB_KEY); // 先讀固定 key
    if (typeof html !== "string" || !html) {
      // 可選：找第一個 ckdoc: 開頭的 key 當作備援
      const allKeys = await keys();
      const firstCkKey = allKeys.find(
        (k) => typeof k === "string" && k.startsWith("ckdoc:")
      );
      if (firstCkKey) html = await get(firstCkKey);
    }
    editorHtml.value = typeof html === "string" ? html : "";
  } finally {
    editorLoading.value = false;
  }
}

/* basic states */
const tab = ref("admin");
const loading = ref(false);
const saving = ref(false);
const uploading = ref(0);
const switchBusyId = ref("");

/* admin list */
const banners = ref([]);
let unlistenAll = null;

/* site active banner */
const siteActiveBanner = ref(null);
const siteLoading = ref(false);
let unlistenActive = null;

/* read all banners for admin */
async function listenAll() {
  loading.value = true;
  if (unlistenAll) unlistenAll();
  const q = query(collection(db, "banners"), orderBy("createdAt", "desc"));
  unlistenAll = onSnapshot(
    q,
    (snap) => {
      banners.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      loading.value = false;
    },
    (err) => {
      loading.value = false;
      console.error(err);
      ElMessage.error("讀取失敗");
    }
  );
}
function reload() {
  listenAll();
}

/* listen the only enabled one for site */
function listenActive() {
  siteLoading.value = true;
  if (unlistenActive) unlistenActive();
  const q = query(collection(db, "banners"), where("enabled", "==", true), limit(1));
  unlistenActive = onSnapshot(
    q,
    (snap) => {
      siteActiveBanner.value = snap.empty
        ? null
        : { id: snap.docs[0].id, ...snap.docs[0].data() };
      siteLoading.value = false;
    },
    (err) => {
      siteLoading.value = false;
      console.error(err);
      ElMessage.error("前台資料讀取失敗");
    }
  );
}

/* toggle site listener only when tab is site */
watch(
  tab,
  (t) => {
    if (t === "site") listenActive();
    else if (unlistenActive) unlistenActive();
  },
  { immediate: true }
);

// 切換到「編輯器展示畫面」分頁時才讀（避免無謂查詢）
watch(
  tab,
  (t) => {
    if (t === "editor") loadEditorHtml();
  },
  { immediate: true }
);

/* dialog / form */
const dialog = reactive({ open: false });
const formRef = ref();
const form = reactive({ id: "", name: "", images: [] });
const fileList = ref([]);
const preview = reactive({ open: false, url: "" });
const uploadRef = ref(null);

function openCreate() {
  resetForm();
  dialog.open = true;
}
function openEdit(row) {
  resetForm();
  form.id = row.id;
  form.name = row.name;
  form.images = Array.isArray(row.images) ? [...row.images] : [];
  fileList.value = form.images.map((url, i) => ({ name: `img-${i}`, url }));
  dialog.open = true;
}
function resetForm() {
  form.id = "";
  form.name = "";
  form.images = [];
  fileList.value = [];
  uploading.value = 0;
  preview.open = false;
  preview.url = "";
}

const internalFiles = ref([]); // Array<UploadFile>

function onFileChange(_file, files) {
  internalFiles.value = files; // 這份 files 就是 element-plus 幫你維護的檔案列
}
function onRemoveFile(file) {
  if (!file || !file.url) return;
  form.images = form.images.filter((u) => u !== file.url);
  fileList.value = fileList.value.filter((f) => f.url !== file.url);
}
function onPreviewFile(file) {
  preview.url = file && file.url ? file.url : "";
  preview.open = !!preview.url;
}

// 修正：把「有 blob: 預覽 URL」也視為尚未上傳
async function ensureAllFilesUploaded() {
  // 來源以元件實例為主，退而求其次用我們同步好的 internalFiles
  const filesFromRef = uploadRef.value?.uploadFiles ?? [];
  const files = filesFromRef.length ? filesFromRef : internalFiles.value;

  // 條件：只要有 raw，且（沒有 url）或（url 以 blob: 開頭）→ 都要真的上傳
  const pendings = files.filter(
    (f) => f.raw && (!f.url || (typeof f.url === "string" && f.url.startsWith("blob:")))
  );

  for (const f of pendings) {
    try {
      uploading.value++;
      const url = await uploadImageToCloudinary(f.raw); // 真上傳到 Cloudinary
      f.url = url; // 回填為正式網址，取代 blob
      f.status = "success"; // 讓 UI 顯示為完成（可選）
      if (!form.images.includes(url)) form.images.push(url);
    } finally {
      uploading.value--;
    }
  }

  // 去重，確保都是正式網址
  form.images = Array.from(new Set(form.images.filter(Boolean)));
}

/* create / update */
async function submit() {
  await formRef.value?.validate();
  await ensureAllFilesUploaded();

  if (uploading.value > 0) {
    ElMessage.warning("還有檔案上傳中，請稍候…");
    return;
  }

  // 保險：若還留有 blob 預覽，視為尚未完成上傳
  const stillBlob = internalFiles.value.some(
    (f) => typeof f.url === "string" && f.url.startsWith("blob:")
  );
  if (form.images.length === 0 && stillBlob) {
    ElMessage.error("尚有圖片未完成上傳，請稍候再試");
    return;
  }

  try {
    saving.value = true;
    if (!form.id) {
      await addDoc(collection(db, "banners"), {
        name: form.name.trim(),
        images: [...form.images], // 這裡會是 Cloudinary 正式網址
        enabled: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      ElMessage.success("新增完成");
    } else {
      await updateDoc(doc(db, "banners", form.id), {
        name: form.name.trim(),
        images: [...form.images],
        updatedAt: serverTimestamp(),
      });
      ElMessage.success("已儲存");
    }
    dialog.open = false;
  } catch (e) {
    console.error(e);
    ElMessage.error("儲存失敗");
  } finally {
    saving.value = false;
  }
}

/* delete */
async function removeRow(row) {
  try {
    await deleteDoc(doc(db, "banners", row.id));
    ElMessage.success("已刪除");
  } catch (e) {
    console.error(e);
    ElMessage.error("刪除失敗");
  }
}

/* enable only one */
async function onToggleEnabled(row, val) {
  try {
    await ElMessageBox.confirm(
      `確定要${val ? "啟用" : "停用"}「${row.name}」？${
        val ? "(會自動停用其他 Banner)" : ""
      }`,
      "確認",
      { confirmButtonText: "確定", cancelButtonText: "取消" }
    );
  } catch {
    reload();
    return;
  }

  switchBusyId.value = row.id;
  try {
    const batch = writeBatch(db);

    if (val) {
      const snap = await getDocs(query(collection(db, "banners")));
      snap.forEach((d) => {
        if (d.id !== row.id && d.data().enabled) {
          batch.update(d.ref, { enabled: false, updatedAt: serverTimestamp() });
        }
      });
    }

    batch.update(doc(db, "banners", row.id), {
      enabled: !!val,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    ElMessage.success(val ? "已啟用" : "已停用");
  } catch (e) {
    console.error(e);
    ElMessage.error("狀態更新失敗");
  } finally {
    switchBusyId.value = "";
  }
}

/* cloudinary url helper */
function cdn(img, opts = "f_auto,q_auto") {
  return img && img.includes("/upload/")
    ? img.replace("/upload/", `/upload/${opts}/`)
    : img;
}

// ---------------------- 新增：特色卡片資料 ----------------------
const featureCards = [
  { icon: Timer, title: "快速交付", desc: "小步快跑、週週可見成果" },
  { icon: User, title: "專業團隊", desc: "Vue3 / Nuxt / 移動端皆有實戰" },
  { icon: Setting, title: "客製方案", desc: "依需求彈性組合模組" },
  { icon: Setting, title: "售後保障", desc: "穩定維運與迭代支援" },
];

// ---------------------- 新增：FAQ ----------------------
const faqList = [
  { q: "開發時程怎麼估？", a: "由需求工作量評估，通常以週為單位迭代，先做 MVP 再擴充。" },
  {
    q: "是否支援既有系統串接？",
    a: "可，包含 REST / WebSocket / 第三方金流與身分驗證等。",
  },
  { q: "專案上線後維運怎麼做？", a: "提供保固與維護契約，可依月／季約檢視與調整。" },
];

// ---------------------- 新增：CTA 事件 ----------------------
function onContact() {
  // 你可以改成 router.push('/contact')
  window.location.href = "mailto:hello@example.com?subject=合作洽談";
}
function onLearnMore() {
  // 你可以改成 router.push('/about')
  window.open("https://example.com", "_blank");
}

/* lifecycle */
onMounted(() => {
  listenAll();
  if (tab.value === "site") listenActive();
});
onBeforeUnmount(() => {
  if (unlistenAll) unlistenAll();
  if (unlistenActive) unlistenActive();
});
</script>

<style scoped>
:deep(.el-upload--picture-card) {
  display: grid;
  place-items: center;
}

/* ===== 富文本展示樣式：新增 ===== */
.rich-html :where(img, video) {
  max-width: 100%;
  height: auto;
}
.rich-html :where(table) {
  border-collapse: collapse;
  width: 100%;
}
.rich-html :where(table, th, td) {
  border: 1px solid #e5e7eb; /* = gray-200 */
  padding: 6px 8px;
}
.rich-html :where(pre, code) {
  background: #f8fafc; /* = gray-50 */
  border-radius: 8px;
  padding: 10px 12px;
  overflow: auto;
}
.rich-html :where(blockquote) {
  border-left: 3px solid #e5e7eb;
  margin: 8px 0;
  padding: 6px 12px;
  color: #6b7280; /* = gray-500 */
}
</style>

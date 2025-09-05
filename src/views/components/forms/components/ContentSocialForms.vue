<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <template #header><b>發佈內容（示意）</b></template>
      <el-form :model="post" label-width="90px">
        <el-form-item label="標題"
          ><el-input v-model="post.title" maxlength="100" show-word-limit
        /></el-form-item>
        <el-form-item label="正文">
          <el-input
            v-model="post.body"
            type="textarea"
            :rows="5"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="標籤">
          <el-select
            v-model="post.tags"
            multiple
            filterable
            allow-create
            class="!w-full"
          />
        </el-form-item>
        <el-form-item label="封面">
          <el-upload
            drag
            :file-list="coverList"
            :limit="1"
            :auto-upload="false"
            :before-upload="beforeCoverUpload"
            :on-change="onCoverChange"
            :on-remove="onCoverRemove"
            :on-exceed="onCoverExceed"
            :http-request="uploadCover"
            class="w-full"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">拖曳上傳 或<em> 點擊上傳</em></div>
            <template #tip>
              <div class="el-upload__tip">限制上傳檔案大小 500kb</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-switch v-model="post.publish" active-text="立即公開" />
          <el-date-picker
            v-if="!post.publish"
            v-model="post.schedule"
            type="datetime"
            class="ml-3"
            placeholder="排程時間"
          />
        </el-form-item>
        <el-form-item
          ><el-button type="primary" @click="save">發佈</el-button></el-form-item
        >
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import { db } from "@/lib/firebase.js";
import { collection, doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { uploadImageToCloudinary } from "@/lib/cloudinary.js";

const post = reactive({
  title: "",
  body: "",
  tags: [],
  publish: true,
  schedule: "", // el-date-picker(type="datetime") 會給 Date
  coverUrl: "", // 預覽或上傳結果的 URL
});

const coverList = ref([]); // el-upload 檔案列
const coverFile = ref(null); // 真正的原始檔（要上傳 Cloudinary）
const coverPercent = ref(0); // 進度條

function beforeCoverUpload(rawFile) {
  const okType = ["image/jpeg", "image/png", "image/webp"].includes(rawFile.type);
  if (!okType) {
    ElMessage.error("僅支援 JPG / PNG / WebP");
    return false;
  }
  const okSize = rawFile.size / 1024 <= 500;
  if (!okSize) {
    ElMessage.error("請將圖片壓縮到 500 KB 以內");
    return false;
  }
  return true;
}

function onCoverChange(file, files) {
  coverList.value = files.slice(-1);
  coverFile.value = file?.raw || null;

  if (post.coverUrl && post.coverUrl.startsWith("blob:")) {
    URL.revokeObjectURL(post.coverUrl);
  }
  if (coverFile.value) post.coverUrl = URL.createObjectURL(coverFile.value);
}

function onCoverRemove(_file, files) {
  coverList.value = files;
  if (post.coverUrl && post.coverUrl.startsWith("blob:")) {
    URL.revokeObjectURL(post.coverUrl);
  }
  post.coverUrl = "";
  coverFile.value = null;
}

function onCoverExceed(files) {
  coverList.value = files.slice(0, 1);
  coverFile.value = files[0]?.raw || null;
}

// el-upload 的自訂 http-request（如果你仍有 :http-request 綁定才需保留）
async function uploadCover({ file, onSuccess, onError }) {
  try {
    if (!post.coverUrl) post.coverUrl = URL.createObjectURL(file);
    setTimeout(() => onSuccess({ url: post.coverUrl }, file), 150);
  } catch (err) {
    onError?.(err);
  }
}

async function save() {
  try {
    if (!post.title.trim()) return ElMessage.error("請輸入標題");

    let finalCoverUrl = post.coverUrl;

    // 1) 若目前只是本地預覽（blob:），就真的上傳 Cloudinary
    if (coverFile.value && !/^https?:\/\//.test(finalCoverUrl)) {
      finalCoverUrl = await uploadImageToCloudinary(coverFile.value);
    }

    if (!finalCoverUrl) return ElMessage.error("請先上傳封面");

    // 2) 準備 Firestore 欄位
    const newDocRef = doc(collection(db, "posts"));
    let scheduleTs = null;
    if (!post.publish && post.schedule) {
      const d = post.schedule instanceof Date ? post.schedule : new Date(post.schedule);
      scheduleTs = Timestamp.fromDate(d);
    }

    // 3) 寫入 Firestore
    await setDoc(newDocRef, {
      title: post.title.trim(),
      body: post.body,
      tags: [...post.tags],
      publish: post.publish,
      schedule: scheduleTs,
      coverUrl: finalCoverUrl, // Cloudinary 圖片 URL
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    ElMessage.success("發佈成功！");
    // 需要可重置欄位
    // post.title=''; post.body=''; post.tags=[]; post.publish=true; post.schedule='';
    // coverList.value=[]; coverFile.value=null; post.coverUrl=''; coverPercent.value=0;
  } catch (e) {
    console.error("[save] error", e);
    ElMessage.error(e?.message || "發佈失敗，請稍後再試");
  }
}

onBeforeUnmount(() => {
  if (post.coverUrl && post.coverUrl.startsWith("blob:")) {
    URL.revokeObjectURL(post.coverUrl);
  }
});
</script>

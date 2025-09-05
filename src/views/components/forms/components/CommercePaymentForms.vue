<template>
  <div class="space-y-4">
    <!-- 收貨地址 -->
    <el-card shadow="never">
      <template #header><b>收貨人 / 地址</b></template>
      <el-form :model="addr" label-width="90px">
        <el-form-item label="姓名"><el-input v-model="addr.name" /></el-form-item>
        <el-form-item label="電話"
          ><el-input v-model="addr.phone" placeholder="09xxxxxxxx"
        /></el-form-item>
        <el-form-item label="地區">
          <el-cascader v-model="addr.region" :options="regionOptions" />
        </el-form-item>
        <el-form-item label="地址"><el-input v-model="addr.detail" /></el-form-item>
        <el-form-item
          ><el-switch v-model="addr.default" active-text="設為預設"
        /></el-form-item>
      </el-form>
    </el-card>

    <!-- 信用卡 -->
    <el-card shadow="never">
      <template #header><b>信用卡（示意）</b></template>

      <el-form :model="card" label-width="90px" v-loading="ocr.loading">
        <el-form-item label="卡號">
          <div class="flex items-center gap-2 w-full">
            <el-input
              v-model="card.no"
              maxlength="19"
              placeholder="4242 4242 4242 4242"
              @input="maskCard"
              class="flex-1"
            />
          </div>
          <template #error>
            <span v-if="ocr.msg" class="text-red-500 text-xs">{{ ocr.msg }}</span>
          </template>
        </el-form-item>

        <el-form-item label="到期">
          <el-input
            v-model="card.exp"
            maxlength="5"
            placeholder="MM/YY"
            @input="maskExp"
          />
        </el-form-item>

        <el-form-item label="CVC">
          <el-input v-model="card.cvc" maxlength="4" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="pay">付款（demo）</el-button>
        </el-form-item>

        <el-form-item label="卡片相片">
          <div class="flex items-center gap-3">
            <el-upload
              :auto-upload="false"
              accept="image/*"
              :show-file-list="false"
              :on-change="onCardImage"
            >
              <el-button :loading="ocr.loading">從相片辨識</el-button>
            </el-upload>

            <img v-if="ocr.preview" :src="ocr.preview" class="h-14 rounded" />
          </div>
          <div v-if="ocr.lastError" class="text-red-500 text-xs mt-1">
            {{ ocr.lastError }}
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import { taiwanRegions } from "@/utils/taiwan-regions.js";
import Tesseract from "tesseract.js";

/* -------------------- 基本資料 -------------------- */
const addr = reactive({ name: "", phone: "", region: [], detail: "", default: true });
const regionOptions = taiwanRegions;

const card = reactive({ no: "", exp: "", cvc: "" });

/* OCR 狀態：載入、預覽、錯誤訊息、欄位提示 */
const ocr = reactive({ loading: false, preview: "", lastError: "", msg: "" });

/* -------------------- 手動輸入格式化 -------------------- */
function maskCard() {
  card.no = card.no
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}
function maskExp() {
  const v = card.exp.replace(/\D/g, "").slice(0, 4);
  card.exp = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v;
}
function pay() {
  ElMessage.success("已送出（demo）");
}

/* -------------------- 上傳圖片 → OCR → 解析 -------------------- */
async function onCardImage(file) {
  try {
    const raw = file?.raw;
    console.log("[OCR] onCardImage() file: ", JSON.stringify({ uid: file?.uid }));
    if (!(raw instanceof File)) {
      ocr.lastError = "未取得原始檔（file.raw）。";
      return;
    }

    ocr.loading = true;
    ocr.lastError = "";
    ocr.msg = "";
    ocr.preview = URL.createObjectURL(raw);

    // 1) 前處理（放大、二值化）
    const pre = await preprocessForOcr(raw);
    console.log("[OCR] preprocessed:", pre.width, "x", pre.height);

    // 2) OCR
    console.time("[OCR] recognize");
    const { data } = await Tesseract.recognize(pre.canvas, "eng", {
      logger: (m) => console.log("[OCR] progress:", m),
    });
    console.timeEnd("[OCR] recognize");
    console.log("[OCR] raw text:", data?.text?.slice(0, 300) || "");

    // 3) 解析（含容錯＆Luhn）
    const parsed = parseCardFromOcr(data?.text || "");
    console.log("[OCR] parsed: ", parsed);

    // 4) 回填
    if (parsed.cardNo) card.no = formatCardNo(parsed.cardNo);
    if (parsed.exp) card.exp = parsed.exp;

    if (!parsed.cardNo && !parsed.exp) {
      ocr.lastError = "沒有從圖片中辨識到卡號或到期日；請改用更大、更正面的相片。";
    } else {
      if (parsed.meta.lowConfidence) {
        ocr.msg = "已帶入卡號（低可信度，請覆核）";
        ElMessage.warning(ocr.msg);
      } else {
        ElMessage.success("已從相片帶入卡片資訊（demo）");
      }
    }
  } catch (err) {
    console.error("[OCR] error:", err);
    ocr.lastError = `OCR 失敗：${err?.message || err}`;
  } finally {
    ocr.loading = false;
  }
}

/* -------------------- 影像前處理 -------------------- */
async function preprocessForOcr(file) {
  const img = await fileToImage(file);

  // 長邊至少 1600，放大有助於辨識
  const longSide = Math.max(img.width, img.height);
  const scale = longSide < 1600 ? 1600 / longSide : 1;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  // 灰階 + 拉對比 + 二值化
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const contrast = 1.35; // >1 加強對比
  const threshold = 150; // 0~255 二值化門檻
  for (let i = 0; i < d.length; i += 4) {
    let g = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; // 灰階
    g = (g - 128) * contrast + 128; // 對比
    const bin = g >= threshold ? 255 : 0; // 二值
    d[i] = d[i + 1] = d[i + 2] = bin;
  }
  ctx.putImageData(imgData, 0, 0);

  return { canvas, width: w, height: h };
}
function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/* -------------------- 文字解析（容錯 + Luhn） -------------------- */
function luhnCheck(num) {
  let sum = 0,
    alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = +num[i];
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}
function formatCardNo(num) {
  return num
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}
function normalizeForDigits(s) {
  const map = {
    O: "0",
    o: "0",
    D: "0",
    Q: "0",
    I: "1",
    l: "1",
    "|": "1",
    "!": "1",
    L: "1",
    Z: "2",
    z: "2",
    S: "5",
    s: "5",
    b: "6",
    B: "8",
    "—": "-",
    "–": "-",
  };
  return s.replace(/./g, (ch) => map[ch] ?? ch);
}
function parseCardFromOcr(rawText) {
  const cleaned = normalizeForDigits(rawText)
    .replace(/[^\dA-Za-z\/\- ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 卡號候選（允許有空白或破折號，總長 15–19）
  const candPattern = /(?:\b[\dA-Za-z]{4}(?:[ -][\dA-Za-z]{4}){2,4}\b)|(?:\b[\dA-Za-z]{15,19}\b)/g;
  const rawCandidates = cleaned.match(candPattern) || [];
  const candidates = [
    ...new Set(rawCandidates.map((c) => normalizeForDigits(c).replace(/[^\d]/g, ""))),
  ].filter((n) => n.length >= 15 && n.length <= 19);

  // 優先選 Luhn 通過的；否則選最長的（低可信度）
  let chosen = candidates.find((n) => luhnCheck(n));
  let lowConfidence = false;
  if (!chosen && candidates.length) {
    chosen = candidates.sort((a, b) => b.length - a.length)[0];
    lowConfidence = true;
  }

  // 到期日：寬鬆擷取（容許雜訊）
  const expPattern = /([0-9]{1,2})\D{0,2}[\/\-]\D{0,2}([0-9]{2,4})/g;
  let exp = "";
  for (const m of cleaned.matchAll(expPattern)) {
    let mm = m[1].padStart(2, "0").slice(-2);
    let yy = m[2].slice(-2);
    if (!(+mm >= 1 && +mm <= 12)) {
      if (mm === "88") mm = "08"; // demo 圖常見 88/88
    }
    exp = `${mm}/${yy}`;
    break;
  }

  // 調試資訊
  console.groupCollapsed("[OCR] 解析詳情");
  console.log("[raw]", rawText);
  console.log("[cleaned]", cleaned);
  console.table(candidates.map((n) => ({ candidate: n, luhn: luhnCheck(n) })));
  console.log("[chosen]", chosen || "(none)", "lowConfidence:", lowConfidence);
  console.log("[exp]", exp || "(none)");
  console.groupEnd();

  return { cardNo: chosen || "", exp: exp || "", meta: { lowConfidence, candidates } };
}
</script>

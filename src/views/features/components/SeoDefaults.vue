<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
    <!-- 左：模板與 Robots -->
    <el-card shadow="never" class="rounded-2xl lg:col-span-8">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="font-semibold">模板與 Robots</div>
          <el-button plain @click="store.applySitemapRobotsRecommended({ force: true })">
            一鍵套用建議值
          </el-button>
        </div>
      </template>

      <!-- Title 模板 -->
      <el-form :model="defaults" label-width="90px" class="mt-2">
        <el-form-item label="Title 模板">
          <el-input v-model="defaults.titleTemplate" placeholder="{title}｜{siteName}" />
        </el-form-item>
        <div
          class="ml-[90px] mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
        >
          <div class="font-medium text-gray-700">這是做什麼？</div>
          <ul class="mt-1 list-disc pl-5">
            <li>
              以變數自動組合每頁 Title（例如
              <code>{title}｜{siteName}</code>），未覆寫也有合理標題。
            </li>
            <li>顯示於搜尋結果藍色標題與瀏覽器分頁；有助 CTR 與品牌一致性。</li>
            <li>建議主關鍵字置前、品牌置後；長度 ≤ 60 字，避免關鍵字堆疊。</li>
          </ul>
        </div>

        <!-- 描述模板 -->
        <el-form-item label="描述模板" class="mt-6">
          <el-input v-model="defaults.descTemplate" type="textarea" :rows="4" />
        </el-form-item>
        <div
          class="ml-[90px] mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
        >
          <div class="font-medium text-gray-700">這是做什麼？</div>
          <ul class="mt-1 list-disc pl-5">
            <li>自動產生搜尋摘要（灰字）；雖非直接排名因子，會影響點擊率。</li>
            <li>
              常用 <code>{excerpt}</code> 作備援文字；建議 80–120
              字，清楚告訴使用者「為什麼要點」。
            </li>
            <li>若摘要與查詢不符，搜尋引擎可能改寫顯示，屬正常現象。</li>
          </ul>
        </div>

        <!-- Canonical 模式 -->
        <el-form-item label="Canonical" class="mt-6">
          <el-select v-model="defaults.canonicalMode" class="w-60">
            <el-option label="自動（移除 UTM / page 參數）" value="auto" />
            <el-option label="自訂（依單頁覆寫）" value="custom" />
          </el-select>
        </el-form-item>
        <div
          class="ml-[90px] mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
        >
          <div class="font-medium text-gray-700">這是做什麼？</div>
          <ul class="mt-1 list-disc pl-5">
            <li>統一網址權重，避免因 UTM 或分頁參數造成重複內容評估。</li>
            <li>建議使用「自動」，常見場景可直接處理；特殊頁再於單頁覆寫。</li>
          </ul>
        </div>

        <!-- Robots -->
        <el-form-item label="Robots 預設" class="mt-6">
          <div class="flex flex-wrap items-center gap-6">
            <div class="flex items-center gap-2">
              <span class="text-gray-600">索引</span>
              <el-switch v-model="defaults.robotsIndex" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-600">連結</span>
              <el-switch v-model="defaults.robotsFollow" />
            </div>
          </div>
        </el-form-item>
        <div
          class="ml-[90px] mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
        >
          <div class="font-medium text-gray-700">這是做什麼？</div>
          <ul class="mt-1 list-disc pl-5">
            <li>
              <code>index/noindex</code> 控制是否收錄；正式站建議 <b>index</b>，測試站建議
              <b>noindex</b>。
            </li>
            <li>
              <code>follow/nofollow</code> 控制是否傳遞連結權重；一般維持 <b>follow</b>。
            </li>
            <li>
              特殊頁（如分頁 page/2、站內搜尋）可在單頁層改為 <code>noindex</code>。
            </li>
          </ul>
        </div>
      </el-form>
    </el-card>

    <!-- 右：Open Graph / Twitter -->
    <el-card shadow="never" class="rounded-2xl lg:col-span-4">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="font-semibold">Open Graph / Twitter</div>
          <el-button plain @click="store.applyOGRecommended({ force: true })">
            一鍵套用建議值
          </el-button>
        </div>
      </template>

      <!-- 沿用模板 -->
      <el-form :model="og" label-width="85px" class="mt-2">
        <el-form-item label="沿用模板">
          <div class="flex items-center gap-3">
            <el-switch v-model="og.inherit" />
            <el-button
              size="small"
              type="primary"
              plain
              v-if="og.inherit"
              @click="switchToCustom"
            >
              切換成自訂
            </el-button>
            <el-button size="small" plain v-else @click="fillSample">
              填入示例資料
            </el-button>
          </div>
        </el-form-item>
        <div
          class="ml-[10px] mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
        >
          <div class="font-medium text-gray-700">
            什麼是「沿用模板」？為什麼欄位沒有假資料？
          </div>
          <ul class="mt-1 list-disc pl-5">
            <li>
              開啟後，OG 標題/描述會「沿用左側的
              Title／描述模板」自動產生；因此欄位保持空白並鎖定，代表使用模板結果。
            </li>
            <li>若你想要在社群分享時顯示不同文字，就將「沿用模板」關閉，改為自訂。</li>
            <li>
              需要快速展示可按「填入示例資料」加入假資料（僅 UI 示意，不寫入內容來源）。
            </li>
          </ul>
        </div>

        <!-- 分享圖 -->
        <el-form-item label="分享圖 URL" class="mt-6">
          <el-input v-model="og.image" placeholder="https://..." :disabled="false" />
        </el-form-item>
        <div
          class="ml-[10px] mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
        >
          <div class="font-medium text-gray-700">這是做什麼？</div>
          <ul class="mt-1 list-disc pl-5">
            <li>
              社群分享縮圖（Open Graph / Twitter Card）。建議 1200×630、大小 &lt; 2MB。
            </li>
            <li>
              若不填，系統可使用「預設分享圖」或內容首圖（可於「內容模板」規則決定）。
            </li>
          </ul>
        </div>

        <!-- OG 文案 -->
        <el-form-item label="OG 標題" class="mt-6">
          <el-input v-model="og.title" :disabled="og.inherit" />
        </el-form-item>
        <el-form-item label="OG 描述">
          <el-input v-model="og.desc" :disabled="og.inherit" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
// 說明：全站預設（模板、Robots、OG）
import { storeToRefs } from "pinia";
import { useSeoStore } from "@/stores/seo";

const store = useSeoStore();
const { defaults, og } = storeToRefs(store);

/* 切換成自訂（關閉沿用模板） */
function switchToCustom() {
  og.value.inherit = false;
}

/* 填入示例資料（僅 UI 示範） */
function fillSample() {
  og.value.inherit = false;
  if (!og.value.title) og.value.title = "用後台自動化你的 SEO｜完整指南";
  if (!og.value.desc) {
    og.value.desc =
      "用標題/描述模板快速生成可用 SEO 文案，社群分享可自訂更吸睛的標題與摘要，減少人工、提升轉換。";
  }
  if (!og.value.image) {
    og.value.image =
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format";
  }
}
</script>

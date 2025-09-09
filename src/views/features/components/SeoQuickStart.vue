<template>
  <div class="space-y-5">
    <!-- 進度條（步驟 1-3） -->
    <el-steps
      :active="currentStep"
      align-center
      finish-status="info"
      class="rounded-2xl bg-white/70 p-4"
    >
      <el-step title="Step 1" description="站點基本資訊" @click="goStep(0)"></el-step>
      <el-step title="Step 2" description="標題／描述模板" @click="goStep(1)"></el-step>
      <el-step title="Step 3" description="索引與地圖" @click="goStep(2)"></el-step>
    </el-steps>

    <!-- 主版型：左側設定 / 右側導覽 -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <!-- 左側：當前步驟的單一設定卡 -->
      <div class="lg:col-span-8">
        <el-card shadow="never" class="rounded-2xl">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="font-semibold">{{ steps[currentStep].header }}</div>
              <el-tag type="info" effect="plain">{{ steps[currentStep].why }}</el-tag>
            </div>
          </template>

          <!-- Step 1：站點基本資訊 -->
          <!-- Step 1：站點基本資訊（直接整段替換） -->
          <div v-if="currentStep === 0">
            <el-form :model="site" label-width="110px" class="mt-2">
              <el-form-item label="網站名稱">
                <el-input v-model="site.name" placeholder="例如：MyDevCraft" />
                <!-- 說明文案：網站名稱 -->
                <div
                  class="mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
                >
                  <div class="font-medium text-gray-700">為什麼要設定網站名稱？</div>
                  <ul class="mt-1 list-disc pl-5">
                    <li>
                      用於 <code>{siteName}</code> 樣板變數、OG
                      站名與部分結構化資料，確保品牌一致。
                    </li>
                    <li>
                      對使用者：強化品牌辨識與點擊率；對搜尋引擎：建立穩定的品牌查詢訊號。
                    </li>
                  </ul>
                  <div class="mt-1">
                    <span class="font-medium text-gray-700">建議：</span
                    >使用正式品牌名、精簡好讀；避免堆疊關鍵字或加入
                    「官方網站」等多餘字詞，並盡量不要頻繁更改。
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="主要語系">
                <el-select v-model="site.locale" placeholder="選擇語系" class="w-full">
                  <el-option label="繁體中文 (zh-TW)" value="zh-TW" />
                  <el-option label="英文 (en-US)" value="en-US" />
                  <el-option label="日文 (ja-JP)" value="ja-JP" />
                </el-select>
                <!-- 說明文案：主要語系 -->
                <div
                  class="mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
                >
                  <div class="font-medium text-gray-700">為什麼要設定主要語系？</div>
                  <ul class="mt-1 list-disc pl-5">
                    <li>
                      決定 <code>&lt;html lang&gt;</code>、<code>og:locale</code>
                      等語言標記，協助搜尋引擎正確理解內容語言。
                    </li>
                    <li>
                      影響後續多語/地區版本的
                      <code>hreflang</code> 基準，避免語言誤配與重複內容評估。
                    </li>
                  </ul>
                  <div class="mt-1">
                    <span class="font-medium text-gray-700">建議：</span
                    >選擇網站內容量最多、面向的主要受眾語言；此設定與後台顯示語言無關。
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="主網域">
                <el-input v-model="site.domain" placeholder="例如：example.com" />
                <!-- 說明文案：主網域 -->
                <div
                  class="mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
                >
                  <div class="font-medium text-gray-700">為什麼要設定主網域？</div>
                  <ul class="mt-1 list-disc pl-5">
                    <li>
                      用來產生全站 <code>canonical</code>、Sitemap 連結與 OG
                      網址，統一網址權重（www/非 www、http/https）。
                    </li>
                    <li>可避免重複內容與分散權重，讓外部連結與收錄更集中。</li>
                  </ul>
                  <div class="mt-1">
                    <span class="font-medium text-gray-700">建議：</span
                    >只填「裸網域」不含
                    <code>http(s)://</code> 與路徑；若未來更換網域，請搭配 301 轉址與
                    Search Console 站點搬遷流程。
                  </div>
                </div>
              </el-form-item>
            </el-form>

            <!-- 底部整體說明 -->
            <div
              class="mt-4 rounded-md bg-[#f5f7fa] px-4 py-3 text-sm leading-6 text-gray-700"
            >
              <div class="font-medium">完成 Step 1 後系統會自動做什麼？</div>
              <ul class="mt-1 list-disc pl-5">
                <li>
                  在標題樣板中注入
                  <code>{siteName}</code>，未覆寫的頁面仍有一致的品牌標題。
                </li>
                <li>
                  以主網域產生 <code>canonical</code> 與 Sitemap
                  連結，並協助統一網址規格。
                </li>
                <li>
                  設定語言相關標記（如
                  <code>html[lang]</code>、<code>og:locale</code>），改善語言/地區辨識。
                </li>
                <li>
                  為後續「內容模板」與「Sitemap/Robots」分頁提供基礎資訊，減少重複人工設定。
                </li>
              </ul>
            </div>

            <div class="mt-4 flex items-center justify-between">
              <el-button disabled>上一步</el-button>
              <div class="flex items-center gap-2">
                <el-button
                  type="primary"
                  plain
                  @click="store.applyStep1Recommended({ force: true })"
                >
                  一鍵套用建議值</el-button
                >
                <el-button type="primary" @click="nextStep">下一步</el-button>
              </div>
            </div>
          </div>

          <!-- Step 2：標題／描述模板（整段替換） -->
          <div v-else-if="currentStep === 1">
            <el-form :model="defaults" label-width="110px" class="mt-2">
              <!-- Title 模板 -->
              <el-form-item label="Title 模板">
                <div class="w-full space-y-2">
                  <el-input
                    v-model="defaults.titleTemplate"
                    placeholder="{title}｜{siteName}"
                  />
                  <div class="text-xs text-gray-500 flex items-center gap-2">
                    可用變數：
                    <template v-for="item in tokenItems" :key="item.key">
                      <el-tooltip placement="top" :content="`${item.zh}：${item.desc}`">
                        <el-tag
                          size="large"
                          type="info"
                          class="cursor-pointer"
                          @click="defaults.titleTemplate += item.key"
                        >
                          {{ item.key }}
                        </el-tag>
                      </el-tooltip>
                    </template>
                  </div>
                </div>

                <!-- 說明：Title 模板 -->
                <div
                  class="w-full mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
                >
                  <div class="font-medium text-gray-700">
                    Title 模板是什麼？會出現在哪裡？
                  </div>
                  <ul class="mt-1 list-disc pl-5">
                    <li>
                      顯示位置：Google
                      搜尋結果的藍色標題、瀏覽器分頁標題；若社群分享沿用模板，亦作為 OG
                      標題。
                    </li>
                    <li>
                      用途：用變數自動組合每頁標題，未個別填寫時也有一致、可讀的格式。
                    </li>
                    <li>
                      建議寫法：<code>{title}｜{siteName}</code>。主關鍵字置前、品牌置後，長度建議
                      ≤ 60 字。
                    </li>
                    <li>避免：關鍵字堆疊、特殊符號過多、不同頁面重複同一標題。</li>
                  </ul>
                </div>
              </el-form-item>

              <!-- 描述模板 -->
              <el-form-item label="描述模板">
                <div class="w-full space-y-2">
                  <el-input
                    v-model="defaults.descTemplate"
                    type="textarea"
                    :rows="3"
                    placeholder="{excerpt}"
                  />
                  <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2 text-gray-500">
                      <span>可用變數：</span>
                      <template v-for="item in tokenItems" :key="item.key + '-desc'">
                        <el-tooltip placement="top" :content="`${item.zh}：${item.desc}`">
                          <el-tag
                            size="small"
                            class="cursor-pointer"
                            @click="defaults.descTemplate += item.key"
                          >
                            {{ item.key }}
                          </el-tag>
                        </el-tooltip>
                      </template>
                    </div>
                    <span
                      :class="store.descCount > 120 ? 'text-red-600' : 'text-gray-500'"
                    >
                      當前：{{ store.descCount }} 字（建議 ≤ 120）
                    </span>
                  </div>
                </div>

                <!-- 說明：描述模板 -->
                <div
                  class="w-full mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
                >
                  <div class="font-medium text-gray-700">
                    描述模板是什麼？為什麼需要？
                  </div>
                  <ul class="mt-1 list-disc pl-5">
                    <li>
                      顯示位置：搜尋結果的灰色摘要。雖非直接排名因子，但大幅影響點擊率（CTR）。
                    </li>
                    <li>
                      用途：自動產生簡潔摘要，未逐頁撰寫時也能有合理說明；常用
                      <code>{excerpt}</code> 作為後備文字。
                    </li>
                    <li>
                      建議內容：80–120 字，1–2
                      句清楚說明價值與行動（例如「立即了解/查看範例」），語句自然包含主題關鍵字。
                    </li>
                    <li>
                      提醒：若摘要與查詢不相符，搜尋引擎可能會改寫顯示內容，屬正常現象。
                    </li>
                  </ul>
                </div>
              </el-form-item>
            </el-form>

            <div class="mt-4 flex items-center justify-between">
              <el-button @click="prevStep">上一步</el-button>
              <div class="flex items-center gap-2">
                <el-button
                  type="primary"
                  plain
                  @click="store.applyStep2Recommended({ force: true })"
                >
                  一鍵套用建議值</el-button
                >
                <el-button type="info" @click="nextStep">下一步</el-button>
              </div>
            </div>
          </div>

          <!-- Step 3：索引與地圖（新版樣式，像第一張圖） -->
          <div v-else>
            <!-- Robots 設定 -->
            <el-form :model="defaults" label-width="140px" class="mt-2">
              <el-form-item label="Robots 預設">
                <div class="flex flex-wrap items-center gap-6">
                  <!-- 索引：index / noindex -->
                  <div class="flex items-center gap-2">
                    <span class="text-gray-600">索引</span>
                    <el-switch v-model="defaults.robotsIndex" />
                  </div>
                  <!-- 連結：follow / nofollow -->
                  <div class="flex items-center gap-2">
                    <span class="text-gray-600">連結</span>
                    <el-switch v-model="defaults.robotsFollow" />
                  </div>
                </div>
              </el-form-item>

              <!-- 灰底說明：Robots -->
              <div
                class="ml-[140px] mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
              >
                <div class="font-medium text-gray-700">這是做什麼？</div>
                <ul class="mt-1 list-disc pl-5">
                  <li>
                    <code>索引</code> 控制頁面是否被收錄；建議正式站預設
                    <b>index</b>，測試站預設 <b>noindex</b>。
                  </li>
                  <li>
                    <code>連結</code> 控制是否傳遞連結權重；大多數情況維持 <b>follow</b>。
                  </li>
                  <li>
                    單頁仍可覆寫（例如：分頁頁面、搜尋結果頁可改為
                    <code>noindex</code>）。
                  </li>
                </ul>
              </div>
            </el-form>

            <!-- Sitemap 設定 -->
            <el-form :model="sitemap" label-width="140px" class="mt-6">
              <el-form-item label="自動 Sitemap">
                <el-switch v-model="sitemap.enabled" />
              </el-form-item>
              <div
                class="ml-[140px] mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
              >
                <div class="font-medium text-gray-700">這是做什麼？</div>
                <ul class="mt-1 list-disc pl-5">
                  <li>自動產生 <code>sitemap.xml</code>，讓搜尋引擎快速發現新頁面。</li>
                  <li>發佈內容時可自動重建（後續可在 Hooks 內掛上）。</li>
                </ul>
              </div>

              <el-form-item label="Ping 搜尋引擎" class="mt-6">
                <el-switch v-model="sitemap.pingEnabled" />
              </el-form-item>
              <div
                class="ml-[140px] mt-2 rounded-md bg-[#f5f7fa] px-4 py-2 text-sm leading-6 text-gray-600"
              >
                <div class="font-medium text-gray-700">這是做什麼？</div>
                <ul class="mt-1 list-disc pl-5">
                  <li>在重建 Sitemap 後，主動通知搜尋引擎（如 Google、Bing）。</li>
                  <li>有助於加速新內容被抓取與更新。</li>
                </ul>
              </div>

              <el-form-item label="上次生成" class="mt-6">
                <el-input
                  :model-value="store.formatTime(sitemap.lastBuiltAt)"
                  disabled
                  class="w-60"
                />
              </el-form-item>

              <div class="ml-[140px] mt-2 text-xs text-gray-500">
                測試環境建議預設 <b>noindex</b>；此處示意 UI，實作時可依環境自動切換。
              </div>
            </el-form>

            <!-- 操作列 -->
            <div class="mt-6 flex items-center justify-between">
              <el-button @click="prevStep">上一步</el-button>
              <div class="flex items-center gap-2">
                <el-button @click="goStep(0)">回到 Step 1</el-button>
                <el-button type="primary">完成</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右側：導覽說明 -->
      <div class="lg:col-span-4 space-y-4">
        <!-- 右上：每個設定的導覽說明（可放圖） -->
        <el-card shadow="never" class="rounded-2xl">
          <template #header>
            <div class="font-semibold">設定導覽</div>
          </template>

          <div class="space-y-3">
            <!-- 可點擊切換導覽 -->
            <div class="flex flex-wrap gap-2">
              <el-tag
                v-for="(s, idx) in steps"
                :key="s.key"
                :type="infoKey === s.key ? 'info' : 'info'"
                effect="light"
                class="cursor-pointer"
                @click="infoKey = s.key"
              >
                {{ s.short }}
              </el-tag>
            </div>

            <!-- 導覽內容 -->
            <div class="mt-2">
              <div class="text-lg font-medium">{{ currentInfo.title }}</div>
              <p class="mt-1 text-sm text-gray-600 leading-6">
                {{ currentInfo.text }}
              </p>

              <!-- 示意圖（可換成你的教學圖） -->
              <div class="mt-3">
                <img
                  :src="currentInfo.img"
                  alt="guide"
                  class="w-full rounded-lg border object-cover"
                  style="max-height: 180px"
                />
              </div>
            </div>
          </div>
        </el-card>

        <!-- 右下：黃色總說明區 -->
        <div class="rounded-xl p-4" :style="{ background: '#fff3cd', color: '#7f6532' }">
          <div class="font-semibold mb-2">為什麼要先做「快速開始」？</div>
          <ul class="list-disc pl-5 space-y-1 text-sm leading-6">
            <li>一次設定全站預設值，沒填的頁面也能有合格的 Title／Description。</li>
            <li>自動產出 Sitemap 與合理的 Robots，讓搜尋引擎更快正確收錄。</li>
            <li>將 SEO 流程標準化，減少每頁人工操作，專注在重要內容。</li>
            <li>之後若有特例，再到「內容模板」或單頁覆寫即可微調。</li>
          </ul>
          <div class="mt-2 text-xs opacity-80">
            小提示：本頁只負責「最低可用」設定，進階功能請到其他分頁逐步開啟。
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 說明：快速開始（一步一頁 + 右側導覽）
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useSeoStore } from "@/stores/seo";

const store = useSeoStore();
const { site, defaults, sitemap } = storeToRefs(store);

/* 當前步驟（0,1,2） */
const currentStep = ref(0);

/* 步驟定義（標題、為什麼） */
const steps = [
  {
    key: "site",
    short: "站點基本資訊",
    header: "Step 1：站點基本資訊",
    why: "模板與 canonical 需要基礎資料",
    guide: {
      title: "設定網站名稱 / 語系 / 主網域",
      text: "這些資訊會被模板與 canonical 使用，能確保標題一致性與網址正規化。",
      img:
        "https://m2z7h8d7.delivery.rocketcdn.me/wp-content/uploads/2023/08/SEO%E7%B6%B2%E5%9D%80%E7%B5%84%E6%88%90%E5%85%83%E7%B4%A0%E4%BB%8B%E7%B4%B9-1024x576.png%E6%8B%B7%E8%B2%9D.png",
    },
  },
  {
    key: "tpl",
    short: "標題／描述模板",
    header: "Step 2：標題／描述模板",
    why: "沒填也有好結果，減少每頁重複",
    guide: {
      title: "用變數組合全站 Title 與描述",
      text:
        "以 {title}、{siteName}、{excerpt} 等變數組合模板，未覆寫的頁面也會自動產生合理的 SEO 文字。",
      img: "https://www.da-vinci.com.tw/uploads/editor/files/SEO-search-result(1).jpg",
    },
  },
  {
    key: "index",
    short: "索引與地圖",
    header: "Step 3：索引與地圖",
    why: "讓搜尋引擎正確抓取",
    guide: {
      title: "Robots 與 Sitemap 一次就緒",
      text:
        "以 index/follow 控制可索引性，開啟自動 Sitemap 與 Ping，讓新內容更快被發現。",
      img:
        "https://www.da-vinci.com.tw/uploads/images/70751efca994427b9930c10361f30485.png",
    },
  },
];

// 變數 Tag 的中文與意義（給 tooltip 用）
const tokenItems = [
  { key: "{title}", zh: "標題", desc: "當前內容的標題（文章／產品／頁面名稱）" },
  { key: "{siteName}", zh: "站台名稱", desc: "在 Step 1 設定的網站名稱，用於品牌識別" },
  { key: "{category}", zh: "分類", desc: "內容所屬分類名稱（如：部落格、產品分類）" },
  { key: "{excerpt}", zh: "摘要", desc: "內容前幾句的抓取文字，作為說明／備援摘要" },
  { key: "{page}", zh: "頁碼", desc: "分頁頁碼（列表第 2 頁以上會用到）" },
  { key: "{date}", zh: "日期", desc: "發佈日期（YYYY-MM-DD），可用於新聞等情境" },
];

/* 右側導覽：目前選取的說明 Key */
const infoKey = ref(steps[0].key);

/* 右側導覽：目前說明內容 */
const currentInfo = computed(() => {
  const found = steps.find((s) => s.key === infoKey.value) || steps[0];
  return {
    title: found.guide.title,
    text: found.guide.text,
    img: found.guide.img,
  };
});

/* 切換步驟（含同步右側導覽） */
function goStep(i) {
  currentStep.value = i;
  infoKey.value = steps[i].key;
}
function nextStep() {
  if (currentStep.value < steps.length - 1) {
    goStep(currentStep.value + 1);
  }
}
function prevStep() {
  if (currentStep.value > 0) {
    goStep(currentStep.value - 1);
  }
}
</script>

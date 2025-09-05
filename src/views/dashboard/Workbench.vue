<template>
  <div class="space-y-4">
    <!-- ===== Header（統計列）===== -->
    <el-card
      :body-style="{ padding: '12px 16px' }"
      class="rounded-xl border border-gray-200 shadow-sm"
      shadow="never"
    >
      <div class="flex items-center justify-between py-3">
        <!-- 左：頭像 + 問候 -->
        <div class="flex items-center gap-3">
          <el-avatar
            :size="64"
            src="https://i.pinimg.com/736x/c4/ea/8b/c4ea8bf28dd46e81339c825ff8248533.jpg"
          />
          <div>
            <div class="text-lg font-semibold text-slate-800">
              {{ greetText }}，{{ displayName }}！
            </div>
            <div class="text-sm text-gray-500">
              {{ weatherText || t("pages.workbench.weather.sample") }}
            </div>
          </div>
        </div>

        <!-- 右：統計 -->
        <div class="flex items-center gap-8 pr-4">
          <div class="text-right">
            <div class="text-xs text-gray-400">
              {{ t("pages.workbench.stats.projects") }}
            </div>
            <div class="text-2xl font-semibold text-slate-800">{{ totalCount }}</div>
          </div>
          <div class="h-6 w-px bg-gray-200" />
          <div class="text-right">
            <div class="text-xs text-gray-400">{{ t("pages.workbench.stats.todo") }}</div>
            <div class="text-2xl font-semibold text-slate-800">{{ todoCount }}</div>
          </div>
          <div class="h-6 w-px bg-gray-200" />
          <div class="text-right">
            <div class="text-xs text-gray-400">
              {{ t("pages.workbench.stats.doing") }}
            </div>
            <div class="text-2xl font-semibold text-slate-800">{{ doingCount }}</div>
          </div>
          <div class="h-6 w-px bg-gray-200" />
          <div class="text-right">
            <div class="text-xs text-gray-400">{{ t("pages.workbench.stats.done") }}</div>
            <div class="text-2xl font-semibold text-slate-800">{{ doneCount }}</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- ===== Board：水平捲動 5 欄 ===== -->
    <div class="overflow-x-auto">
      <div class="flex items-start gap-4 min-w-max">
        <!-- 每欄 -->
        <el-card
          v-for="list in board.lists"
          :key="list.id"
          :body-style="{ padding: '12px' }"
          class="!w-[320px] rounded-xl border border-amber-200/60 shadow-sm flex flex-col"
          shadow="never"
          style="background-color: #f9fafb"
        >
          <!-- 欄頭（Trello 風） -->
          <div class="flex items-center justify-between px-1 pb-2">
            <!-- 標題：自訂優先，否則顯示語系預設 -->
            <template v-if="editingListId !== list.id">
              <div
                class="text-[15px] font-semibold text-slate-800 select-none"
                @dblclick="startRename(list.id)"
              >
                {{ list.name || defaultListNames[list.id] }}
              </div>
            </template>
            <template v-else>
              <el-input
                v-model="list.name"
                size="small"
                class="!w-40"
                data-list-rename="true"
                autofocus
                @keyup.enter="finishRename()"
                @blur="finishRename()"
              />
            </template>

            <!-- 右上 ... 功能 -->
            <el-dropdown trigger="click" @command="(cmd) => runListCommand(list, cmd)">
              <el-button link class="text-slate-500 hover:text-slate-700">
                <MoreFilled />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="add">{{
                    t("pages.workbench.actions.menu.add")
                  }}</el-dropdown-item>
                  <el-dropdown-item command="rename">{{
                    t("pages.workbench.actions.menu.rename")
                  }}</el-dropdown-item>
                  <el-dropdown-item command="sort-created">
                    {{ t("pages.workbench.actions.menu.sortCreated") }}
                  </el-dropdown-item>
                  <el-dropdown-item command="sort-due">
                    {{ t("pages.workbench.actions.menu.sortDue") }}
                  </el-dropdown-item>
                  <el-dropdown-item divided command="export">
                    {{ t("pages.workbench.actions.menu.export") }}
                  </el-dropdown-item>
                  <el-dropdown-item command="import">
                    {{ t("pages.workbench.actions.menu.import") }}
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="list.id !== 'template'"
                    divided
                    command="clear"
                    class="!text-red-500"
                  >
                    {{ t("pages.workbench.actions.menu.clear") }}
                  </el-dropdown-item>

                  <!-- Template：複製/移動 -->
                  <el-dropdown-item v-if="list.id === 'template'" divided>
                    <el-switch
                      v-model="templateCopyMode"
                      inline-prompt
                      :active-text="t('workbench.actions.menu.copyModeOn')"
                      :inactive-text="t('workbench.actions.menu.copyModeOff')"
                      @change="saveNow()"
                    />
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- 欄身：卡片列表 -->
          <div
            class="list-dropzone px-1"
            :class="
              list.id === 'doing' && list.wipLimit && list.cardIds.length > list.wipLimit
                ? 'outline outline-red-200 rounded-lg'
                : ''
            "
          >
            <draggable
              :list="list.cardIds"
              item-key="id"
              class="space-y-3 min-h-[8px]"
              :group="groupConfig(list)"
              ghost-class="opacity-50"
              @add="(e) => onAdd(list, e)"
              @update="onReorder"
              @end="saveDebounced"
            >
              <template #item="{ element: cardId }">
                <CardRow
                  v-if="cards[cardId]"
                  :card="cards[cardId]"
                  :list="list"
                  @edit="openEditCard"
                  @delete="deleteCard"
                  @move="
                    (toListId) =>
                      moveCard(
                        cardId,
                        toListId,
                        board.lists.find((l) => l.id === toListId).cardIds.length,
                        { mode: 'move' }
                      )
                  "
                />
              </template>
            </draggable>
          </div>

          <!-- 欄底：+ Add another card -->
          <div class="mt-3">
            <button
              class="w-full flex items-center justify-between text-slate-600 hover:text-slate-800 bg-slate-100/60 hover:bg-slate-100 px-3 py-2 rounded-lg transition"
              @click="openCreateCard(list.id)"
            >
              <span class="inline-flex items-center gap-2">
                <span class="text-xl leading-none">+</span>
                {{ t("pages.workbench.actions.addAnother") }}
              </span>
              <span class="text-slate-400"><i class="i-ep-plus" /></span>
            </button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- ===== Dialog：卡片編輯（含標籤/清單/到期/清單數量/頭像） ===== -->
    <el-dialog
      v-model="edit.visible"
      :title="
        edit.mode === 'create'
          ? t('pages.workbench.dialog.createTitle')
          : t('pages.workbench.dialog.editTitle')
      "
      width="560px"
      destroy-on-close
    >
      <el-form :model="edit.form" label-width="90px">
        <el-form-item :label="t('pages.workbench.dialog.fields.title')" required>
          <el-input v-model="edit.form.title" :maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item :label="t('pages.workbench.dialog.fields.labels')">
          <el-select
            v-model="edit.form.labels"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="t('pages.workbench.dialog.fields.labels')"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item :label="t('pages.workbench.dialog.fields.note')">
          <el-input
            v-model="edit.form.note"
            type="textarea"
            :rows="5"
            :maxlength="10000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="t('pages.workbench.dialog.fields.dueDate')">
          <el-date-picker
            v-model="edit.form.dueDate"
            type="date"
            :placeholder="t('pages.workbench.dialog.fields.dueDate')"
            value-format="x"
          />
        </el-form-item>

        <el-form-item :label="t('pages.workbench.dialog.fields.checklist')">
          <div class="flex items-center gap-2">
            <el-input-number v-model="edit.form.checklist.done" :min="0" :max="999" />
            <span class="text-gray-500">/</span>
            <el-input-number v-model="edit.form.checklist.total" :min="0" :max="999" />
          </div>
        </el-form-item>

        <el-form-item :label="t('pages.workbench.dialog.fields.assigneeAvatar')">
          <el-input v-model="edit.form.assigneeAvatar" placeholder="Avatar Image URL" />
        </el-form-item>

        <el-form-item :label="t('pages.workbench.dialog.fields.list')">
          <el-select v-model="edit.form.listId" style="width: 240px">
            <el-option
              v-for="l in board.lists"
              :key="l.id"
              :label="l.name || defaultListNames[l.id]"
              :value="l.id"
              :disabled="l.id === 'template'"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="edit.visible = false">{{
          t("pages.workbench.dialog.btn.cancel")
        }}</el-button>
        <el-button type="primary" @click="saveEditCard">{{
          t("pages.workbench.dialog.btn.save")
        }}</el-button>
      </template>
    </el-dialog>

    <!-- ===== Dialog：匯入（單一清單） ===== -->
    <el-dialog v-model="importDlg.visible" title="匯入到清單" width="700px">
      <el-alert type="info" show-icon :closable="false" class="mb-3">
        <template #title>請貼上 JSON</template>
        <div class="text-xs text-gray-500">
          可貼「卡片陣列」或「{ cards: [...]
          }」格式，欄位：title、note、labels、dueDate、checklist、assigneeAvatar…
        </div>
      </el-alert>
      <el-input v-model="importDlg.text" type="textarea" :rows="12" spellcheck="false" />
      <template #footer>
        <el-button @click="importDlg.visible = false">{{
          t("pages.workbench.dialog.btn.cancel")
        }}</el-button>
        <el-button type="primary" @click="confirmImport">{{
          t("pages.workbench.dialog.btn.save")
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import draggable from "vuedraggable";
import { MoreFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CardRow from "@/components/mini-trello/CardRow.vue";
import { getWeatherInfo } from "@/api/weather";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

/* ===================== Header 區塊 ===================== */

// 顯示名稱（你可以改成從登入資訊帶入）
const displayName = ref("長晰");

// 問候語（早安 / 午安 / 晚安）
const greetText = computed(() => {
  const h = new Date().getHours();
  const key = h < 11 ? "morning" : h < 18 ? "noon" : "evening";
  return t(`pages.workbench.greet.${key}`);
});

// Header 天氣字串
const weatherText = ref("");

async function loadWeather() {
  try {
    const w = await getWeatherInfo();
    if (w && (w.wx || w.minT || w.maxT)) {
      weatherText.value = `今天${w.wx}，${w.minT}℃ – ${w.maxT}℃！`;
    }
  } catch (e) {
    console.warn("[weather] 取得失敗：", e);
  }
}

// ===== 統計（排除 Template 欄）=====
const realLists = computed(() => (board.lists || []).filter((l) => l.id !== "template"));

const totalCount = computed(() =>
  realLists.value.reduce((sum, l) => sum + (l.cardIds?.length || 0), 0)
);

const todoCount = computed(
  () => board.lists.find((l) => l.id === "todo")?.cardIds.length || 0
);
const doingCount = computed(
  () => board.lists.find((l) => l.id === "doing")?.cardIds.length || 0
);
const doneCount = computed(
  () => board.lists.find((l) => l.id === "done")?.cardIds.length || 0
);

/* ===================== 空板預設（無初始卡片） ===================== */
const EMPTY_DATA = {
  board: {
    id: "default",
    title: "我的看板",
    lists: [
      { id: "todo", name: "ToDo", wipLimit: null, cardIds: [] },
      { id: "doing", name: "Doing", wipLimit: 3, cardIds: [] },
      { id: "done", name: "Done", wipLimit: null, cardIds: [] },
      { id: "remark", name: "Remark", wipLimit: null, cardIds: [] },
      { id: "template", name: "Template", wipLimit: null, cardIds: [] },
    ],
  },
  cards: {},
};

/* ===================== 狀態與儲存 ===================== */

const defaultListNames = computed(() => ({
  todo: t("pages.workbench.lists.todo"),
  doing: t("pages.workbench.lists.doing"),
  done: t("pages.workbench.lists.done"),
  remark: t("pages.workbench.lists.remark"),
  template: t("pages.workbench.lists.template"),
}));

const LS_KEY = "mini-trello-board";
const state = loadFromLS() || structuredClone(EMPTY_DATA);

const board = reactive(state.board);
const cards = reactive(state.cards);

function loadFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.board || !parsed.cards) return null;
    return parsed;
  } catch {
    return null;
  }
}

const saveNow = () => {
  localStorage.setItem(LS_KEY, JSON.stringify({ board, cards }));
};
let saveTimer = null;
const saveDebounced = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 500);
};

/* ===================== 工具 ===================== */
const nanoid = (p = "c") =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const newTitle = reactive({ todo: "", doing: "", done: "", remark: "", template: "" });
const templateCopyMode = ref(true); // Template 欄預設「複製」

/* ===================== CRUD ===================== */
function addCard(listId, payload) {
  const title = (payload?.title || "").trim();
  if (!title) return;
  const id = nanoid("c");
  const now = Date.now();
  cards[id] = {
    id,
    title,
    note: payload.note || "",
    labels: payload.labels || [], // 新：標籤陣列
    checklist: payload.checklist || { done: 0, total: 0 }, // 新：checklist
    assigneeAvatar: payload.assigneeAvatar || "", // 新：頭像
    dueDate: payload.dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const list = board.lists.find((l) => l.id === listId);
  if (!list) return;
  list.cardIds.push(id);
  newTitle[listId] = "";
  adding[listId] = false;
  saveDebounced();
  return id;
}

function updateCard(cardId, patch) {
  if (!cards[cardId]) return;
  Object.assign(cards[cardId], patch, { updatedAt: Date.now() });
  saveDebounced();
}

function deleteCard(cardId) {
  board.lists.forEach((l) => {
    const i = l.cardIds.indexOf(cardId);
    if (i >= 0) l.cardIds.splice(i, 1);
  });
  delete cards[cardId];
  saveDebounced();
}

function moveCard(cardId, toListId, toIndex, { mode = "move" } = {}) {
  const fromList = board.lists.find((l) => l.cardIds.includes(cardId));
  const toList = board.lists.find((l) => l.id === toListId);
  if (!toList) return;

  if (mode === "copy") {
    const newId = nanoid("c");
    cards[newId] = {
      ...cards[cardId],
      id: newId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    toList.cardIds.splice(Math.max(0, toIndex), 0, newId);
  } else {
    if (fromList) {
      const i = fromList.cardIds.indexOf(cardId);
      if (i >= 0) fromList.cardIds.splice(i, 1);
    }
    toList.cardIds.splice(Math.max(0, toIndex), 0, cardId);
  }
  saveDebounced();
}

function renameList(listId, name) {
  const l = board.lists.find((l) => l.id === listId);
  if (!l) return;
  l.name = name;
  saveDebounced();
}

async function clearList(listId) {
  const l = board.lists.find((l) => l.id === listId);
  if (!l) return;
  if (l.id === "template") return;
  await ElMessageBox.confirm(`確定要清空「${l.name}」嗎？此動作不可復原。`, "二次確認", {
    type: "warning",
  });
  l.cardIds.forEach((id) => {
    if (cards[id]) delete cards[id];
  });
  l.cardIds = [];
  saveDebounced();
}

function sortList(listId, by) {
  const l = board.lists.find((l) => l.id === listId);
  if (!l) return;
  const arr = l.cardIds.slice();
  arr.sort((a, b) => {
    const ca = cards[a],
      cb = cards[b];
    if (by === "dueDate") {
      const va = ca.dueDate ?? Number.MAX_SAFE_INTEGER;
      const vb = cb.dueDate ?? Number.MAX_SAFE_INTEGER;
      return va - vb;
    }
    return (ca.createdAt || 0) - (cb.createdAt || 0);
  });
  l.cardIds = arr;
  saveDebounced();
}

/* ===================== 匯入 / 匯出（僅清單） ===================== */
const importDlg = reactive({ visible: false, listId: "", text: "" });
function openImportList(listId) {
  importDlg.visible = true;
  importDlg.listId = listId;
  importDlg.text = "";
}
function importToList(listId, json) {
  const l = board.lists.find((x) => x.id === listId);
  if (!l) throw new Error("找不到清單");
  let arr;
  const parsed = JSON.parse(json);
  if (Array.isArray(parsed)) arr = parsed;
  else if (Array.isArray(parsed?.cards)) arr = parsed.cards;
  else throw new Error("格式需為卡片陣列或 { cards: [...] }");

  const newIds = [];
  for (const item of arr) {
    const title = String(item.title || "").trim();
    if (!title) continue;
    const id = nanoid("c");
    cards[id] = {
      id,
      title,
      note: item.note || "",
      labels: item.labels || [],
      checklist: item.checklist || { done: 0, total: 0 },
      assigneeAvatar: item.assigneeAvatar || "",
      dueDate: item.dueDate ?? null,
      createdAt: item.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    newIds.push(id);
  }
  l.cardIds.push(...newIds);
  saveNow();
  ElMessage.success(`已匯入 ${newIds.length} 筆到 ${l.name}`);
}
function confirmImport() {
  try {
    if (!importDlg.text.trim()) return;
    importToList(importDlg.listId, importDlg.text);
    importDlg.visible = false;
  } catch (e) {
    ElMessage.error(String(e?.message || e));
  }
}

/* ===================== 拖拉設定與事件 ===================== */
function groupConfig(list) {
  if (list.id === "template") {
    return {
      name: "cards",
      pull: templateCopyMode.value ? "clone" : true,
      put: true,
      revertClone: true,
    };
  }
  return { name: "cards", pull: true, put: true };
}

function onAdd(targetList, evt) {
  const fromEl = evt.from;
  const isFromTemplate = fromEl?.__list_id === "template";
  const toIndex = evt.newIndex;
  const insertedId = targetList.cardIds[toIndex];

  if (isFromTemplate && templateCopyMode.value) {
    const newId = nanoid("c");
    const src = cards[insertedId];
    cards[newId] = { ...src, id: newId, createdAt: Date.now(), updatedAt: Date.now() };
    targetList.cardIds.splice(toIndex, 1, newId);
  }
  saveDebounced();
}

function onReorder() {
  saveDebounced();
}

/* ===================== 欄位選單動作 ===================== */
// 1) 欄名 inline rename 開關
const editingListId = ref(null);
function startRename(listId) {
  editingListId.value = listId;
}
function finishRename() {
  if (editingListId.value) saveDebounced();
  editingListId.value = null;
}

// 2) 「Add another card」折疊狀態（JS 版）
// 放在 board 定義之後
const adding = reactive({
  todo: false,
  doing: false,
  done: false,
  remark: false,
  template: false,
});
function cancelAdd(listId) {
  adding[listId] = false;
  newTitle[listId] = "";
}

async function runListCommand(list, cmd) {
  if (cmd === "add") {
    openCreateCard(list.id);
    return;
  }

  if (cmd === "rename") {
    startRename(list.id);
    await nextTick();
    const el = document.querySelector('[data-list-rename="true"] input');
    el && el.focus();
    return;
  }

  if (cmd === "clear") {
    await clearList(list.id);
    return;
  }

  if (cmd === "sort-created") {
    sortList(list.id, "createdAt");
    return;
  }

  if (cmd === "sort-due") {
    sortList(list.id, "dueDate");
    return;
  }

  if (cmd === "export") {
    const data = list.cardIds.map((id) => cards[id]).filter(Boolean);
    const blob = new Blob([JSON.stringify({ cards: data }, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `list-${list.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    return;
  }

  if (cmd === "import") {
    openImportList(list.id);
    return;
  }
}

/* ===================== 編輯 Dialog ===================== */
const edit = reactive({
  visible: false,
  mode: "edit", // 'create' | 'edit'
  form: {
    id: "",
    title: "",
    note: "",
    labels: [],
    dueDate: null,
    checklist: { done: 0, total: 0 },
    assigneeAvatar: "",
    listId: "",
  },
});

function openCreateCard(targetListId) {
  edit.mode = "create";
  edit.form = {
    id: "",
    title: "",
    note: "",
    labels: [],
    dueDate: null,
    checklist: { done: 0, total: 0 },
    assigneeAvatar: "",
    listId: targetListId || board.lists[0]?.id || "todo",
  };
  edit.visible = true;
}

function openEditCard(card, list) {
  edit.mode = "edit";
  edit.form = {
    id: card.id,
    title: card.title,
    note: card.note,
    labels: Array.isArray(card.labels) ? [...card.labels] : [],
    dueDate: card.dueDate,
    checklist: card.checklist ? { ...card.checklist } : { done: 0, total: 0 },
    assigneeAvatar: card.assigneeAvatar || "",
    listId: list.id,
  };
  edit.visible = true;
}

function saveEditCard() {
  const payload = {
    title: (edit.form.title || "").trim(),
    note: edit.form.note || "",
    labels: edit.form.labels || [],
    dueDate: edit.form.dueDate ?? null,
    checklist: edit.form.checklist || { done: 0, total: 0 },
    assigneeAvatar: edit.form.assigneeAvatar || "",
  };

  if (!payload.title) return;

  if (edit.mode === "create") {
    // 新增
    addCard(edit.form.listId, payload);
  } else {
    // 編輯
    const id = edit.form.id;
    if (!id) return;
    updateCard(id, payload);
    // 如有換清單
    const curList = board.lists.find((l) => l.cardIds.includes(id));
    if (curList?.id !== edit.form.listId) {
      moveCard(
        id,
        edit.form.listId,
        board.lists.find((l) => l.id === edit.form.listId).cardIds.length,
        { mode: "move" }
      );
    }
  }

  edit.visible = false;
}

/* ===================== 標記來源欄（供 onAdd 判斷 Template） ===================== */
onMounted(() => {
  loadWeather();
  const listEls = document.querySelectorAll(".list-dropzone");
  board.lists.forEach((l, idx) => {
    const el = listEls[idx];
    if (el) el.__list_id = l.id;
  });
});
</script>

<style scoped>
/* 拖動時的透明樣式已用 ghost-class 指定 */
</style>

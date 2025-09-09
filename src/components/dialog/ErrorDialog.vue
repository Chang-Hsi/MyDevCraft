<template>
  <el-dialog v-model="trashDialogVisible" :close-on-click-modal="false" width="380px">
    <div class="flex h-[240px] flex-col px-[24px] py-[8px] justify-between items-center">
      <div class="w-[352px] h-[144px] flex flex-col justify-center items-center gap-4">
        <img src="@/assets/svg/warning.svg" alt="warning" />
        <div class="text-[#303133] text-[20px] font-bold">提示</div>
        <div class="text-[#606266] text-[14px] text-center whitespace-normal break-words">
          {{ errorMessage }}
        </div>
      </div>
      <div class="w-[310px] h-[48px] flex justify-center items-center">
        <button
          @click="handleClose"
          class="h-[48px] w-full rounded-[4px] bg-[#002554] px-4 py-2 text-white"
        >
          確定
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "ErrorDialog",
  props: {
    modelValue: {
      // 改成 modelValue
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      trashDialogVisible: this.modelValue,
    };
  },
  watch: {
    modelValue(newVal) {
      this.trashDialogVisible = newVal;
    },
    trashDialogVisible(newVal) {
      this.$emit("update:modelValue", newVal);
    },
  },
  methods: {
    handleClose() {
      this.$emit("update:modelValue", false);
    },
  },
};
</script>

<template>
  <div class="flex flex-col justify-center items-center pt-48">
    <img src="@/assets/svg/500.svg" alt="500" class="h-[350px]" />
    <span class="mt-4 text-lg text-gray-600">{{ t("pages.error.msg500") }}</span>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>

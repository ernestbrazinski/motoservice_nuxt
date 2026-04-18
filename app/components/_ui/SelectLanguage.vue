<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { LOCALE_OPTIONS, saveLocale } from "~/utils/locale";

const { locale } = useI18n();

function onLocaleChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== "ru" && v !== "en" && v !== "ka") return;
  locale.value = v;
  saveLocale(v);
}
</script>

<template>
  <vl-select
    :value="locale"
    :options="LOCALE_OPTIONS"
    @vl-change="onLocaleChange"
  />
</template>

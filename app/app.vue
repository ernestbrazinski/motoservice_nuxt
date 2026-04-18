<script setup lang="ts">
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { saveLocale, type AppLocale } from "~/utils/locale";

const { locale } = useI18n();
const { headerSubmenuOpen } = useHeaderSubmenuOpen();
const isHeaderSubmenuOpen = computed(() => headerSubmenuOpen.value);

watch(
  locale,
  (l) => {
    document.documentElement.lang = l;
    saveLocale(l as AppLocale);
  },
  { immediate: true },
);
</script>

<template>
  <div class="root">
    <LayoutAppHeader />
    <main
      class="main"
      :class="{ 'main--header-submenu-open': isHeaderSubmenuOpen }"
    >
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { saveLocale, type AppLocale } from '~/utils/locale'

const { locale } = useI18n()

watch(
  locale,
  (l) => {
    document.documentElement.lang = l
    saveLocale(l as AppLocale)
  },
  { immediate: true },
)
</script>

<template>
  <div class="root">
    <LayoutAppHeader />
    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

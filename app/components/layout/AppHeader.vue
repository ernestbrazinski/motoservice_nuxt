<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setTheme } from '~/utils/theme'
import { LOCALE_OPTIONS } from '~/utils/locale'

const { t, locale } = useI18n()

function onThemeChange(value: boolean) {
  setTheme(value ? 'light' : 'dark')
}
</script>

<template>
  <header class="header">
    <div class="container">
      <NuxtLink to="/" class="header__brand"> MotoService </NuxtLink>
      <nav class="header__nav">
        <NuxtLink to="/" class="header__link">{{ t('nav.home') }}</NuxtLink>
        <NuxtLink to="/cabinet" class="header__link">{{
          t('nav.cabinet')
        }}</NuxtLink>
      </nav>
      <div class="header__tools">
        <label class="header__field">
          <UiSelect v-model="locale" :options="LOCALE_OPTIONS" />
        </label>
        <div class="header__theme" role="group" :aria-label="t('theme.toggle')">
          <UiToggleSwitch @change="onThemeChange" />
        </div>
      </div>
    </div>
  </header>
</template>

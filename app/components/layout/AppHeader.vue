<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { setTheme, theme } from "~/utils/theme";
import { LOCALE_OPTIONS } from "~/utils/locale";

const { t, locale } = useI18n();

function onThemeChange(e: Event) {
  const checked = (e as CustomEvent<{ checked: boolean }>).detail?.checked;
  if (typeof checked !== "boolean") return;
  setTheme(checked ? "light" : "dark");
}
</script>

<template>
  <header class="header">
    <div class="container">
      <NuxtLink to="/" class="header__brand"> MotoService </NuxtLink>
      <nav class="header__nav">
        <NuxtLink to="/" class="header__link">{{ "Главная" }}</NuxtLink>
        <NuxtLink to="/" class="header__link">{{ "Мотоциклы" }}</NuxtLink>
        <!-- <NuxtLink to="/" class="header__link">{{ "Продажа" }}</NuxtLink> 
        <NuxtLink to="/" class="header__link">{{ "Ремонт" }}</NuxtLink> 
        <NuxtLink to="/" class="header__link">{{ "Запчасти" }}</NuxtLink>
        <NuxtLink to="/" class="header__link">{{ "Аренда" }}</NuxtLink>
        <NuxtLink to="/" class="header__link">{{ "Мотоподбор" }}</NuxtLink>
        <NuxtLink to="/" class="header__link">{{ "Мотоэвакуатор" }}</NuxtLink> -->

        <NuxtLink to="/" class="header__link">{{ "Экипировка" }}</NuxtLink>

        <NuxtLink to="/" class="header__link">{{ "Комьюнити" }}</NuxtLink>
      </nav>
      <div class="header__tools">
        <label class="header__field">
          <!-- <vl-select v-model="locale" :options="LOCALE_OPTIONS" /> -->
        </label>
        <div class="header__theme" role="group" :aria-label="t('theme.toggle')">
          <vl-toggle-switch
            :checked="theme === 'light'"
            @vl-change="onThemeChange"
          />
        </div>
      </div>
    </div>
  </header>
</template>

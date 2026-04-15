<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const code = ref('')

function open() {
  const c = code.value.trim().toUpperCase()
  if (c.length < 4 || c.length > 12) return
  navigateTo(`/order/${encodeURIComponent(c)}`)
}

function valid() {
  const c = code.value.trim()
  return c.length >= 4 && c.length <= 12
}
</script>

<template>
  <div class="page page--narrow">
    <h1 class="page__title">{{ t('cabinet.title') }}</h1>
    <p class="muted cabinet-intro">{{ t('cabinet.flowIntro') }}</p>
    <p class="muted">{{ t('cabinet.hint') }}</p>
    <form class="form" @submit.prevent="open">
      <label class="form__field">
        <span class="form__label">{{ t('cabinet.codeLabel') }}</span>
        <input
          v-model="code"
          class="form__input"
          type="text"
          autocomplete="off"
          maxlength="12"
        />
      </label>
      <p v-if="code.trim() && !valid()" class="form__error">
        {{ t('cabinet.invalid') }}
      </p>
      <div class="form__actions">
        <button type="submit" class="btn btn--primary" :disabled="!valid()">
          {{ t('cabinet.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>

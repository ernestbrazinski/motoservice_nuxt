<script setup lang="ts">
import { useI18n } from 'vue-i18n'

definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const { logout } = useAdminSession()

function signOut() {
  logout()
  navigateTo('/cabinet')
}
</script>

<template>
  <div class="page page--narrow">
    <section class="card">
      <h1 class="page__title">{{ t('admin.dashboardTitle') }}</h1>
      <p class="muted">{{ t('admin.dashboardLead') }}</p>
      <button type="button" class="btn btn--ghost" @click="signOut">
        {{ t('admin.logout') }}
      </button>
    </section>
  </div>
</template>

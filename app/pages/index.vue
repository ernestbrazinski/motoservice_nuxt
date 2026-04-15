<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createOrderFromForm,
  saveOrder,
  AUCTION_IMPORT_SERVICE_SLUG,
  type ServiceSlug,
} from '~/utils/orders'

const { t } = useI18n()

const serviceOptions: ServiceSlug[] = [
  'repair',
  'parts',
  'pickup_georgia',
  'tow_truck',
  'auction_us_japan',
]

const service = ref<ServiceSlug>('repair')
const notes = ref('')
const showThanks = ref(false)
const thanksAuction = ref(false)

function submit() {
  saveOrder(createOrderFromForm(service.value, notes.value))
  thanksAuction.value = service.value === AUCTION_IMPORT_SERVICE_SLUG
  showThanks.value = true
}

function dismissThanks() {
  showThanks.value = false
}
</script>

<template>
  <div class="page page--narrow">
    <h1 class="page__title">{{ t('home.title') }}</h1>
    <p class="page__lead">{{ t('home.lead') }}</p>

    <section class="card">
      <h2 class="card__title">{{ t('home.servicesTitle') }}</h2>
      <ul class="list">
        <li v-for="slug in serviceOptions" :key="slug" class="list__item">
          {{ t(`services.${slug}`) }}
        </li>
      </ul>
    </section>

    <section v-if="showThanks" class="card card--accent">
      <h2 class="card__title">{{ t('home.thanksTitle') }}</h2>
      <p class="muted">
        {{ thanksAuction ? t('home.thanksAuction') : t('home.thanksGeneric') }}
      </p>
      <button type="button" class="btn btn--ghost" @click="dismissThanks">
        {{ t('home.thanksDismiss') }}
      </button>
    </section>

    <section class="card">
      <h2 class="card__title">{{ t('home.requestTitle') }}</h2>
      <p class="muted">{{ t('home.requestHint') }}</p>
      <form class="form" @submit.prevent="submit">
        <label class="form__field">
          <span class="form__label">{{ t('home.serviceLabel') }}</span>
          <select v-model="service" class="form__input" required>
            <option v-for="slug in serviceOptions" :key="slug" :value="slug">
              {{ t(`services.${slug}`) }}
            </option>
          </select>
        </label>
        <label class="form__field">
          <span class="form__label">{{ t('home.notesLabel') }}</span>
          <textarea
            v-model="notes"
            class="form__input form__input--area"
            rows="3"
            :placeholder="t('home.notesPlaceholder')"
          />
        </label>
        <div class="form__actions">
          <button type="submit" class="btn btn--primary">
            {{ t('home.submit') }}
          </button>
        </div>
      </form>
    </section>

    <section class="card">
      <h2 class="card__title">{{ t('home.auctionTrackTitle') }}</h2>
      <p class="muted">{{ t('home.auctionTrackBody') }}</p>
      <NuxtLink to="/cabinet" class="btn btn--primary">{{
        t('home.auctionTrackLink')
      }}</NuxtLink>
    </section>
  </div>
</template>

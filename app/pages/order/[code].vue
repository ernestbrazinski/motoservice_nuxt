<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getOrder, isAuctionImportOrder, type StoredOrder } from '~/utils/orders'

const route = useRoute()
const code = computed(() => String(route.params.code ?? ''))

const { t, locale } = useI18n()

const rawOrder = computed<StoredOrder | null>(() => getOrder(code.value))

const view = computed(() => {
  const o = rawOrder.value
  if (!o) return { kind: 'missing' as const }
  if (!isAuctionImportOrder(o)) return { kind: 'wrong_service' as const }
  return { kind: 'ok' as const, order: o }
})

const progressKeys = [
  'processing',
  'shipping',
  'customs',
  'georgia',
  'handover',
] as const

function formatDt(iso: string) {
  const tag =
    locale.value === 'ka' ? 'ka-GE' : locale.value === 'ru' ? 'ru-RU' : 'en-US'
  return new Date(iso).toLocaleString(tag)
}
</script>

<template>
  <div class="page page--narrow">
    <template v-if="view.kind === 'missing'">
      <h1 class="page__title">{{ t('cabinet.title') }}</h1>
      <p class="muted">{{ t('order.notFound') }}</p>
      <NuxtLink to="/cabinet" class="btn btn--primary">{{
        t('cabinet.title')
      }}</NuxtLink>
    </template>

    <template v-else-if="view.kind === 'wrong_service'">
      <h1 class="page__title">{{ t('cabinet.title') }}</h1>
      <p class="muted">{{ t('order.notAuctionService') }}</p>
      <div class="form__actions">
        <NuxtLink to="/" class="btn btn--primary">{{
          t('nav.home')
        }}</NuxtLink>
        <NuxtLink to="/cabinet" class="btn btn--ghost">{{
          t('cabinet.submit')
        }}</NuxtLink>
      </div>
    </template>

    <template v-else>
      <h1 class="page__title">{{ t('cabinet.title') }}</h1>

      <section class="card">
        <dl class="kv">
          <dt>{{ t('order.code') }}</dt>
          <dd class="mono">{{ view.order.unique_code }}</dd>
          <dt>{{ t('order.service') }}</dt>
          <dd>{{ t(`services.${view.order.service_type}`) }}</dd>
          <dt>{{ t('order.status') }}</dt>
          <dd>{{ t(`order.statuses.${view.order.statusKey}`) }}</dd>
          <dt>{{ t('order.arrival') }}</dt>
          <dd>
            {{
              view.order.estimated_arrival_date
                ? formatDt(view.order.estimated_arrival_date)
                : t('order.arrivalUnknown')
            }}
          </dd>
        </dl>
        <p v-if="view.order.client_notes" class="order-notes">
          <strong>{{ t('home.notesLabel') }}</strong>
          {{ view.order.client_notes }}
        </p>
      </section>

      <section class="card">
        <h2 class="card__title">{{ t('order.progressTitle') }}</h2>
        <div class="progress">
          <div
            v-for="(key, index) in progressKeys"
            :key="key"
            class="progress__step"
            :class="{ 'is-done': index <= view.order.progress_stage }"
          >
            <span class="progress__label">{{
              t(`order.progress.${key}`)
            }}</span>
          </div>
        </div>
      </section>

      <section class="card">
        <h2 class="card__title">{{ t('order.mediaTitle') }}</h2>
        <p v-if="!view.order.media.length" class="muted">
          {{ t('order.mediaEmpty') }}
        </p>
        <ul v-else class="media-list">
          <li
            v-for="m in view.order.media"
            :key="m.id"
            class="media-list__item"
          >
            <a :href="m.url" class="link" target="_blank" rel="noopener">
              {{ m.type === 'photo' ? t('order.photo') : t('order.video') }}
            </a>
          </li>
        </ul>
      </section>

      <section class="card">
        <h2 class="card__title">{{ t('order.historyTitle') }}</h2>
        <ul class="timeline">
          <li
            v-for="ev in [...view.order.timeline].reverse()"
            :key="ev.id"
            class="timeline__item"
          >
            <time class="timeline__time mono">{{
              formatDt(ev.created_at)
            }}</time>
            <span>{{ t(`timeline.events.${ev.messageKey}`) }}</span>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

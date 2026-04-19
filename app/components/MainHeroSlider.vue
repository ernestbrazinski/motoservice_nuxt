<script setup lang="ts">
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, EffectFade } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";

import "swiper/css";
import "swiper/css/effect-fade";

const BANNER_AUTOPLAY_MS = 6500;

const modules = [Autoplay, EffectFade];

const swiperRef = ref<SwiperClass | null>(null);
const realIndex = ref(0);

function onSwiper(s: SwiperClass) {
  swiperRef.value = s;
}

const slides = [
  {
    badge: "Мотосервис",
    title: "Ремонт и обслуживание",
    text: "Диагностика, ТО и ремонт мототехники — запишитесь на удобное время.",
    image: "/slider/slide-1.jpg",
    cta: { label: "Кабинет", to: "/cabinet" },
  },
  {
    badge: "Запчасти",
    title: "Подбор по Грузии",
    text: "Поможем найти оригинальные и аналоги под вашу модель.",
    image: "/slider/slide-2.jpg",
    cta: { label: "Кабинет", to: "/cabinet" },
  },
  {
    badge: "Эвакуация",
    title: "Мотоэвакуатор",
    text: "Аккуратная транспортировка при поломке или покупке техники.",
    image: "/slider/slide-3.jpg",
    cta: { label: "Кабинет", to: "/cabinet" },
  },
] as const;

const slideCount = slides.length;

function onSlideChange(swiper: SwiperClass) {
  realIndex.value = swiper.realIndex;
}

function goToSlide(index: number) {
  swiperRef.value?.slideToLoop(index);
}
</script>

<template>
  <section class="main-hero-slider" aria-label="Главный баннер">
    <ClientOnly>
      <Swiper
        class="main-hero-slider__swiper"
        :modules="modules"
        effect="fade"
        :fade-effect="{ crossFade: true }"
        :pagination="false"
        :autoplay="{
          delay: BANNER_AUTOPLAY_MS,
          disableOnInteraction: false,
        }"
        :loop="true"
        :speed="700"
        @swiper="onSwiper"
        @slide-change="onSlideChange"
      >
        <SwiperSlide
          v-for="(slide, i) in slides"
          :key="i"
          class="main-hero-slider__slide"
        >
          <div class="main-hero-slider__media">
            <img :src="slide.image" alt="" width="1920" height="1080" />
            <div class="main-hero-slider__scrim" aria-hidden="true" />
          </div>
          <div class="main-hero-slider__content">
            <span class="main-hero-slider__badge">{{ slide.badge }}</span>
            <h2 class="main-hero-slider__title">{{ slide.title }}</h2>
            <p class="main-hero-slider__text">{{ slide.text }}</p>
            <!-- <a class="main-hero-slider__cta" :href="slide.cta.href">{{
              slide.cta.label
            }}</a> -->
          </div>
        </SwiperSlide>
      </Swiper>

      <button
        type="button"
        class="main-hero-slider__edge-btn main-hero-slider__edge-btn--prev"
        aria-label="Предыдущий слайд"
        @click="swiperRef?.slidePrev()"
      />
      <button
        type="button"
        class="main-hero-slider__edge-btn main-hero-slider__edge-btn--next"
        aria-label="Следующий слайд"
        @click="swiperRef?.slideNext()"
      />

      <div
        class="main-hero-slider__dots"
        role="tablist"
        aria-label="Слайды баннера"
      >
        <div class="main-hero-slider__dots-inner">
          <button
            v-for="(_, i) in slides"
            :key="i"
            type="button"
            role="tab"
            :class="[
              'main-hero-slider__dot',
              i === realIndex
                ? 'main-hero-slider__dot--active'
                : 'main-hero-slider__dot--idle',
            ]"
            :aria-selected="i === realIndex"
            :aria-label="`Слайд ${i + 1} из ${slideCount}`"
            @click="goToSlide(i)"
          >
            <span
              v-if="i === realIndex"
              :key="realIndex"
              class="main-hero-pagination-progress"
              :style="{ '--er-banner-autoplay': `${BANNER_AUTOPLAY_MS}ms` }"
            >
              <span
                class="main-hero-pagination-progress__fill"
                aria-hidden="true"
              />
              <span
                class="main-hero-pagination-progress__knob"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>
      </div>

      <template #fallback>
        <div class="main-hero-slider__placeholder" aria-hidden="true" />
      </template>
    </ClientOnly>
  </section>
</template>

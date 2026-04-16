<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  createOrderFromForm,
  saveOrder,
  type ServiceSlug,
} from "~/utils/orders";

const { t } = useI18n();

const serviceOptions: ServiceSlug[] = [
  "repair",
  "parts",
  "pickup_georgia",
  "tow_truck",
];

const service = ref<ServiceSlug>("repair");
const notes = ref("");
const showThanks = ref(false);

function submit() {
  saveOrder(createOrderFromForm(service.value, notes.value));
  showThanks.value = true;
}

function dismissThanks() {
  showThanks.value = false;
}
</script>

<template></template>

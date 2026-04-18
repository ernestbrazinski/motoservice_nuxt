<script setup lang="ts">
import { useAuthSession } from "~/composables/useAuthSession";
import { useCabinetToast } from "~/composables/useCabinetToast";
import AdminCatalogBlocks from "./AdminCatalogBlocks.vue";

const { hydrated, isSuperadmin } = useAuthSession();
const { notifOpen, notifVariant, notifText, notifDelay, dismiss } =
  useCabinetToast();
</script>

<template>
  <div class="container">
    <vl-notification
      :open="notifOpen"
      :variant="notifVariant"
      :delay="notifDelay"
      @vl-close="dismiss"
    >
      {{ notifText }}
    </vl-notification>

    <div v-if="!hydrated" class="cabinet__body cabinet__state">Загрузка…</div>
    <div v-else class="cabinet__body">
      <AdminCatalogBlocks v-if="isSuperadmin" />
    </div>
  </div>
</template>

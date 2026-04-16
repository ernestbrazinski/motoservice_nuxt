<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const { authed, sync, login } = useAdminSession();

const password = ref("");
const error = ref(false);
let isModalOpen = ref(false);

onMounted(() => {
  sync();
  if (authed.value) navigateTo("/admin");
});
</script>

<template>
  <div class="page page-auth">
    <form class="form-auth d-flex d-flex-column gap-16">
      <span class="form-auth__title">Login</span>
      <vl-input type="text" placeholder="Username" />
      <vl-input type="password" placeholder="Password" />
      <vl-button @click="isModalOpen = true">Open Modal</vl-button>
    </form>
  </div>
</template>

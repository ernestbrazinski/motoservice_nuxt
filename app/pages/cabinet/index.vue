<script setup lang="ts">
const { authed } = useAuthSession();
</script>

<template>
  <div class="page page-auth">
    <CabinetLoginForm v-if="!authed" />
    <CabinetAuthedPanel v-else />
  </div>
</template>

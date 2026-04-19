<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number;
  }>(),
  { size: 22 },
);
</script>

<template>
  <svg
    class="icon-menu"
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    focusable="false"
    aria-hidden="true"
  >
    <path
      d="M4 7h16M4 12h16M4 17h16"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

defineOptions({
  name: 'Button',
})

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    to?: RouteLocationRaw
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    to: undefined,
  },
)

const isLink = computed(() => props.to !== undefined && props.to !== '')

const rootClass = computed(() => {
  const list: string[] = ['btn']
  if (props.variant === 'primary') list.push('btn--primary')
  if (props.variant === 'secondary') list.push('btn--secondary')
  return list
})

function onLinkClick(e: MouseEvent) {
  if (props.disabled) e.preventDefault()
}
</script>

<template>
  <NuxtLink
    v-if="isLink"
    :to="to!"
    :class="rootClass"
    :aria-disabled="disabled ? true : undefined"
    :tabindex="disabled ? -1 : undefined"
    @click="onLinkClick"
  >
    <slot />
  </NuxtLink>
  <button v-else :type="type" :disabled="disabled" :class="rootClass">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ToggleSwitch',
})

const model = defineModel<boolean>({ default: false })

const props = withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  change: [value: boolean]
}>()

function onInputChange() {
  emit('change', model.value)
}
</script>

<template>
  <label
    class="ui-switch"
    :class="{ 'is-on': model, 'is-disabled': props.disabled }"
  >
    <input
      v-model="model"
      type="checkbox"
      class="ui-switch__input"
      role="switch"
      :disabled="props.disabled"
      @change="onInputChange"
    />
    <span class="ui-switch__track" aria-hidden="true">
      <span class="ui-switch__glow" />
      <span class="ui-switch__knob">
        <span class="ui-switch__knob-shine" />
      </span>
    </span>
  </label>
</template>

<style scoped lang="scss">
.ui-switch {
  --switch-w: calc(var(--base-size) * 3.25);
  --switch-h: calc(var(--base-size) * 1.875);
  --knob: calc(var(--base-size) * 1.5);
  --pad: calc(var(--base-size) * 0.1875);
  --travel: calc(var(--switch-w) - var(--knob) - var(--pad) * 2);
  --glass-on: rgba(52, 199, 89, 0.55);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:has(.ui-switch__input:focus-visible) .ui-switch__track {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }

  &.is-disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.ui-switch__input {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
  }
}

.ui-switch__track {
  position: relative;
  width: var(--switch-w);
  height: var(--switch-h);
  border-radius: 999px;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-surface) 55%, transparent),
    color-mix(in srgb, var(--color-border) 35%, transparent)
  );
  backdrop-filter: blur(14px) saturate(1.35);
  -webkit-backdrop-filter: blur(14px) saturate(1.35);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.45),
    inset 0 -0.5px 0.5px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08),
    0 0 0 0.5px color-mix(in srgb, var(--color-border) 70%, transparent);
  transition:
    background 0.38s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.38s cubic-bezier(0.4, 0, 0.2, 1);

  .is-on & {
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--glass-on) 88%, white),
      color-mix(in srgb, var(--color-accent) 65%, transparent)
    );
    box-shadow:
      inset 0 1px 1px rgba(255, 255, 255, 0.5),
      inset 0 -1px 1px rgba(0, 0, 0, 0.08),
      0 2px 10px color-mix(in srgb, var(--color-accent) 35%, transparent),
      0 0 0 0.5px color-mix(in srgb, var(--color-accent) 45%, transparent);
  }

  .is-disabled & {
    filter: grayscale(0.15);
  }
}

.ui-switch__glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  background: radial-gradient(
    120% 80% at 30% 0%,
    rgba(255, 255, 255, 0.55),
    transparent 55%
  );
  pointer-events: none;
  transition: opacity 0.35s ease;

  .is-on & {
    opacity: 0.85;
  }
}

.ui-switch__knob {
  position: absolute;
  top: var(--pad);
  left: var(--pad);
  width: var(--knob);
  height: var(--knob);
  border-radius: 50%;
  background: linear-gradient(
    165deg,
    #ffffff 0%,
    color-mix(in srgb, #ffffff 88%, var(--color-muted)) 100%
  );
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.12),
    0 4px 10px rgba(0, 0, 0, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    inset 0 -1px 0 rgba(0, 0, 0, 0.06);
  transform: translate3d(0, 0, 0);
  transition:
    transform 0.42s cubic-bezier(0.34, 1.3, 0.64, 1),
    box-shadow 0.35s ease;

  .is-on & {
    transform: translate3d(var(--travel), 0, 0);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.1),
      0 5px 14px rgba(0, 0, 0, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.05);
  }
}

.ui-switch__knob-shine {
  position: absolute;
  inset: 18% 22% auto 22%;
  height: 32%;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0)
  );
  opacity: 0.9;
  pointer-events: none;
}
</style>

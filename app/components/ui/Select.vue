<script setup lang="ts">
defineOptions({
  name: "Select",
});

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

const model = defineModel<string>({ required: true });

const props = withDefaults(
  defineProps<{
    options: SelectOption[];
    disabled?: boolean;
    id?: string;
    name?: string;
    wide?: boolean;
  }>(),
  {
    disabled: false,
    id: undefined,
    name: undefined,
    wide: false,
  },
);

const emit = defineEmits<{
  change: [value: string];
}>();

function onChange() {
  emit("change", model.value);
}
</script>

<template>
  <select
    :id="props.id"
    :name="props.name"
    class="ui-select"
    :class="{ 'ui-select--wide': props.wide }"
    v-model="model"
    :disabled="props.disabled"
    @change="onChange"
  >
    <option
      v-for="opt in props.options"
      :key="opt.value"
      :value="opt.value"
      :disabled="opt.disabled"
    >
      {{ opt.label }}
    </option>
  </select>
</template>

<style scoped lang="scss">
.ui-select {
  padding: calc(var(--base-size) * 0.35) calc(var(--base-size) * 0.5);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg);
  color: var(--color-text);
  font: inherit;
  min-width: calc(var(--base-size) * 10);
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}

.ui-select--wide {
  width: 100%;
  min-width: 0;
}
</style>

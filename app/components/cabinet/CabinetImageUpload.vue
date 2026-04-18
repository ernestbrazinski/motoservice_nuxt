<script setup lang="ts">
import { ref } from "vue";
import { uploadCabinetImage } from "~/utils/cabinet-upload";
import { useCabinetToast } from "~/composables/useCabinetToast";

const props = withDefaults(
  defineProps<{
    multiple?: boolean;
    disabled?: boolean;
    buttonText?: string;
    buttonTextUploading?: string;
    accept?: string;
  }>(),
  {
    multiple: false,
    disabled: false,
    buttonText: "Загрузить с компьютера",
    buttonTextUploading: "Загрузка…",
    accept: "image/jpeg,image/png,image/webp,image/gif",
  },
);

const emit = defineEmits<{
  done: [urls: string[]];
}>();

const { show: toast } = useCabinetToast();
const inputRef = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const config = useRuntimeConfig();

function openPicker() {
  inputRef.value?.click();
}

async function onChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const list = input.files;
  if (!list?.length) return;
  const graphqlUrl = (config.public.graphqlUrl as string)?.trim() || "";
  if (!graphqlUrl) {
    toast("error", "Не задан GraphQL URL");
    input.value = "";
    return;
  }
  uploading.value = true;
  try {
    const urls: string[] = [];
    for (const file of Array.from(list)) {
      urls.push(await uploadCabinetImage(graphqlUrl, file));
    }
    emit("done", urls);
  } catch (err) {
    toast("error", err instanceof Error ? err.message : "Ошибка загрузки");
  } finally {
    uploading.value = false;
    input.value = "";
  }
}
</script>

<template>
  <div class="cabinet-image-upload">
    <input
      ref="inputRef"
      type="file"
      class="cabinet-file-input"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled || uploading"
      @change="onChange"
    />
    <vl-button
      type="button"
      :disabled="disabled || uploading"
      @click="openPicker"
    >
      {{ uploading ? buttonTextUploading : buttonText }}
    </vl-button>
  </div>
</template>

<style scoped>
.cabinet-image-upload {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--base-size, 8px) * 0.75);
  position: relative;
}
</style>

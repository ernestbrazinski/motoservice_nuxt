<script setup lang="ts">
import { computed, inject, reactive, ref } from "vue";
import { useAdminCatalog } from "~/composables/useAdminCatalog";
import CabinetImageUpload from "./CabinetImageUpload.vue";
import { useCabinetPublicFileUrl } from "~/composables/useCabinetPublicFileUrl";
import { CabinetAdminBusyKey } from "~/constants/cabinetInjection";
import { slugifyToKebabCase } from "~/utils/slugFromName";
import type { VlSelectOption } from "velair-ui";

const props = defineProps<{ disabled: boolean }>();
const adminBusy = inject(CabinetAdminBusyKey)!;

const { categories, submitCategory, submitBrand } = useAdminCatalog();
const imagePreviewSrc = useCabinetPublicFileUrl();

const categorySlugManual = ref(false);
const brandSlugManual = ref(false);

const categoryForm = reactive({
  name: "",
  slug: "",
  parent: "",
});
const brandForm = reactive({ name: "", slug: "", logoUrl: "" });

const parentOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [{ value: "", label: "— без родителя —" }];
  const rest = categories.value.map((c) => ({
    value: String(c.id),
    label: `${c.name} (${c.slug})`,
  }));
  return [...head, ...rest];
});

function onCategoryParentChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) categoryForm.parent = v;
}

function onCatNameIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) categoryForm.name = v;
  if (!categorySlugManual.value) {
    categoryForm.slug = slugifyToKebabCase(categoryForm.name);
  }
}
function onCatSlugIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v === undefined) return;
  categoryForm.slug = v;
  categorySlugManual.value = Boolean(String(v).trim());
}
function onBrandNameIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) brandForm.name = v;
  if (!brandSlugManual.value) {
    brandForm.slug = slugifyToKebabCase(brandForm.name);
  }
}
function onBrandSlugIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v === undefined) return;
  brandForm.slug = v;
  brandSlugManual.value = Boolean(String(v).trim());
}
function onBrandLogoUploaded(urls: string[]) {
  if (urls[0]) brandForm.logoUrl = urls[0];
}

function clearBrandLogo() {
  brandForm.logoUrl = "";
}

async function onCreateCategory() {
  if (props.disabled || adminBusy.value) return;
  adminBusy.value = true;
  try {
    let parentId: number | null = null;
    if (categoryForm.parent?.trim()) {
      const n = Number.parseInt(categoryForm.parent, 10);
      if (!Number.isNaN(n)) parentId = n;
    }
    const ok = await submitCategory({
      name: categoryForm.name,
      slug: categoryForm.slug,
      parentId,
    });
    if (ok) {
      categoryForm.name = "";
      categoryForm.slug = "";
      categoryForm.parent = "";
      categorySlugManual.value = false;
    }
  } finally {
    adminBusy.value = false;
  }
}

async function onCreateBrand() {
  if (props.disabled || adminBusy.value) return;
  adminBusy.value = true;
  try {
    const ok = await submitBrand(brandForm);
    if (ok) {
      brandForm.name = "";
      brandForm.slug = "";
      brandForm.logoUrl = "";
      brandSlugManual.value = false;
    }
  } finally {
    adminBusy.value = false;
  }
}
</script>

<template>
  <div class="admin-tabs__panel" role="tabpanel">
    <details class="admin-section" open>
      <summary>Категория</summary>
      <form class="form-grid" @submit.prevent="onCreateCategory">
        <label class="form-label">
          <vl-input
            :value="categoryForm.name"
            type="text"
            placeholder="Название категории"
            wide
            @vl-input="onCatNameIn"
          />
        </label>
        <label class="form-label">
          <vl-input
            :value="categoryForm.slug"
            type="text"
            wide
            placeholder="slug, kebab-case: a-z, 0-9, hyphens"
            @vl-input="onCatSlugIn"
          />
        </label>
        <label class="form-label form-label--full">
          <span>Родительская категория</span>
          <vl-select
            wide
            :value="categoryForm.parent"
            :options="parentOptions"
            @vl-change="onCategoryParentChange"
          />
        </label>
        <div class="form-label form-label--full">
          <vl-button type="submit" :disabled="disabled">
            Создать категорию
          </vl-button>
        </div>
      </form>
    </details>

    <details class="admin-section" open>
      <summary>Бренд</summary>
      <form class="form-grid" @submit.prevent="onCreateBrand">
        <label class="form-label">
          <vl-input
            :value="brandForm.name"
            type="text"
            wide
            placeholder="Название бренда"
            @vl-input="onBrandNameIn"
          />
        </label>
        <label class="form-label">
          <vl-input
            :value="brandForm.slug"
            type="text"
            wide
            placeholder="slug, kebab-case: a-z, 0-9, hyphens"
            @vl-input="onBrandSlugIn"
          />
        </label>
        <div class="form-label form-label--full">
          <span>Логотип (опционально)</span>
          <div class="cabinet-logo-row">
            <CabinetImageUpload
              :multiple="false"
              button-text="Загрузить логотип"
              :disabled="disabled"
              @done="onBrandLogoUploaded"
            />
            <vl-button
              v-if="brandForm.logoUrl"
              type="button"
              :disabled="disabled"
              @click="clearBrandLogo"
            >
              Убрать
            </vl-button>
          </div>
          <p v-if="brandForm.logoUrl" class="cabinet-logo-preview">
            <img
              :src="imagePreviewSrc(brandForm.logoUrl)"
              alt=""
              width="64"
              height="64"
              class="cabinet-logo-preview__img"
            />
          </p>
        </div>
        <div class="form-label form-label--full">
          <vl-button type="submit" :disabled="disabled"> Создать бренд </vl-button>
        </div>
      </form>
    </details>
  </div>
</template>

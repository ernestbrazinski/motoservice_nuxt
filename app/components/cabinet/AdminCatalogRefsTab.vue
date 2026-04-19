<script setup lang="ts">
import { computed, inject, reactive, ref, watch } from "vue";
import { useAdminCatalog } from "~/composables/useAdminCatalog";
import CabinetImageUpload from "./CabinetImageUpload.vue";
import { useCabinetPublicFileUrl } from "~/composables/useCabinetPublicFileUrl";
import {
  CabinetAdminBusyKey,
  CabinetAdminPendingEditBrandIdKey,
  CabinetAdminPendingEditCategoryIdKey,
} from "~/constants/cabinetInjection";
import { slugifyToKebabCase } from "~/utils/slugFromName";
import type { VlSelectOption } from "velair-ui";

const props = defineProps<{ disabled: boolean }>();
const adminBusy = inject(CabinetAdminBusyKey)!;
const pendingEditCategoryId = inject(
  CabinetAdminPendingEditCategoryIdKey,
  ref<number | null>(null),
);
const pendingEditBrandId = inject(
  CabinetAdminPendingEditBrandIdKey,
  ref<number | null>(null),
);

const {
  categories,
  brands,
  submitCategory,
  submitUpdateCategory,
  submitBrand,
  submitUpdateBrand,
} = useAdminCatalog();
const imagePreviewSrc = useCabinetPublicFileUrl();

const categorySlugManual = ref(false);
const brandSlugManual = ref(false);

/** When set, category form is updating this row instead of creating. */
const editCategoryId = ref<number | null>(null);
/** When set, brand form is updating this row instead of creating. */
const editBrandId = ref<number | null>(null);

const categoryForm = reactive({
  name: "",
  slug: "",
  parent: "",
});
const brandForm = reactive({ name: "", slug: "", logoUrl: "" });

function descendantIdsIncludingSelf(rootId: number): Set<number> {
  const byParent = new Map<number | null, number[]>();
  for (const c of categories.value) {
    const p = c.parentId;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p)!.push(c.id);
  }
  const out = new Set<number>([rootId]);
  const stack = [...(byParent.get(rootId) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    for (const ch of byParent.get(id) ?? []) stack.push(ch);
  }
  return out;
}

const excludedCategoryParentIds = computed(() => {
  const eid = editCategoryId.value;
  if (eid == null) return new Set<number>();
  return descendantIdsIncludingSelf(eid);
});

const parentOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [{ value: "", label: "— без родителя —" }];
  const excluded = excludedCategoryParentIds.value;
  const rest = categories.value
    .filter((c) => !excluded.has(c.id))
    .map((c) => ({
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
  if (editCategoryId.value == null && !categorySlugManual.value) {
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
  if (editBrandId.value == null && !brandSlugManual.value) {
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

function applyCategoryEdit(id: number) {
  const c = categories.value.find((x) => x.id === id);
  if (!c) return;
  editCategoryId.value = id;
  categoryForm.name = c.name;
  categoryForm.slug = c.slug;
  categoryForm.parent = c.parentId != null ? String(c.parentId) : "";
  categorySlugManual.value = true;
}

function applyBrandEdit(id: number) {
  const b = brands.value.find((x) => x.id === id);
  if (!b) return;
  editBrandId.value = id;
  brandForm.name = b.name;
  brandForm.slug = b.slug;
  brandForm.logoUrl = b.logoUrl ?? "";
  brandSlugManual.value = true;
}

watch(
  pendingEditCategoryId,
  (id) => {
    if (id == null) return;
    applyCategoryEdit(id);
    pendingEditCategoryId.value = null;
  },
  { flush: "post" },
);

watch(
  pendingEditBrandId,
  (id) => {
    if (id == null) return;
    applyBrandEdit(id);
    pendingEditBrandId.value = null;
  },
  { flush: "post" },
);

function resetCategoryForm() {
  editCategoryId.value = null;
  categoryForm.name = "";
  categoryForm.slug = "";
  categoryForm.parent = "";
  categorySlugManual.value = false;
}

function resetBrandForm() {
  editBrandId.value = null;
  brandForm.name = "";
  brandForm.slug = "";
  brandForm.logoUrl = "";
  brandSlugManual.value = false;
}

async function onSubmitCategory() {
  if (props.disabled || adminBusy.value) return;
  adminBusy.value = true;
  try {
    let parentId: number | null = null;
    if (categoryForm.parent?.trim()) {
      const n = Number.parseInt(categoryForm.parent, 10);
      if (!Number.isNaN(n)) parentId = n;
    }
    const payload = {
      name: categoryForm.name,
      slug: categoryForm.slug,
      parentId,
    };
    const id = editCategoryId.value;
    const ok =
      id != null
        ? await submitUpdateCategory(id, payload)
        : await submitCategory(payload);
    if (ok) resetCategoryForm();
  } finally {
    adminBusy.value = false;
  }
}

async function onSubmitBrand() {
  if (props.disabled || adminBusy.value) return;
  adminBusy.value = true;
  try {
    const id = editBrandId.value;
    const ok =
      id != null
        ? await submitUpdateBrand({ id, ...brandForm })
        : await submitBrand(brandForm);
    if (ok) resetBrandForm();
  } finally {
    adminBusy.value = false;
  }
}
</script>

<template>
  <div class="admin-tabs__panel" role="tabpanel">
    <details class="admin-section" open>
      <summary>Категория</summary>
      <form class="form-admin" @submit.prevent="onSubmitCategory">
        <p v-if="editCategoryId != null" class="admin-section__hint">
          Редактирование категории #{{ editCategoryId }}
        </p>
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
        <div class="form-label form-label--full form-admin__actions-row">
          <vl-button type="submit" :disabled="disabled">
            {{
              editCategoryId != null
                ? "Сохранить категорию"
                : "Создать категорию"
            }}
          </vl-button>
          <vl-button
            v-if="editCategoryId != null"
            type="button"
            :disabled="disabled"
            @click="resetCategoryForm"
          >
            Отмена
          </vl-button>
        </div>
      </form>
    </details>

    <details class="admin-section" open>
      <summary>Бренд</summary>
      <form class="form-admin" @submit.prevent="onSubmitBrand">
        <p v-if="editBrandId != null" class="admin-section__hint">
          Редактирование бренда #{{ editBrandId }}
        </p>
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
          <span>Загрузить лого</span>
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
        <div class="form-label form-label--full form-admin__actions-row">
          <vl-button type="submit" :disabled="disabled">
            {{ editBrandId != null ? "Сохранить бренд" : "Создать бренд" }}
          </vl-button>
          <vl-button
            v-if="editBrandId != null"
            type="button"
            :disabled="disabled"
            @click="resetBrandForm"
          >
            Отмена
          </vl-button>
        </div>
      </form>
    </details>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { computed, inject, reactive, ref } from "vue";
import { useAdminCatalog } from "~/composables/useAdminCatalog";
import CabinetImageUpload from "./CabinetImageUpload.vue";
import { useCabinetPublicFileUrl } from "~/composables/useCabinetPublicFileUrl";
import { CabinetAdminBusyKey } from "~/constants/cabinetInjection";
import {
  DEFAULT_SHOP_CURRENCY,
  SHOP_CURRENCY_SELECT_OPTIONS,
  normalizeShopCurrency,
  type ShopCurrency,
} from "~/constants/cabinetCatalog";
import type { VlSelectOption } from "velair-ui";

const props = defineProps<{ disabled: boolean }>();
const adminBusy = inject(CabinetAdminBusyKey)!;

const {
  categories,
  brands,
  products,
  loadContext,
  submitUpdateProduct,
  submitAddProductImages,
} = useAdminCatalog();
const imagePreviewSrc = useCabinetPublicFileUrl();

const editProductId = ref("");
const editForm = reactive({
  title: "",
  slug: "",
  description: "",
  price: "",
  currency: DEFAULT_SHOP_CURRENCY as ShopCurrency,
  brand: "",
  category: "",
});

const editProductNewImageUrls = ref<string[]>([]);

const editProductOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [{ value: "", label: "— выберите товар —" }];
  const rest = products.value.map((p) => ({
    value: String(p.id),
    label: `${p.title} (#${p.id})`,
  }));
  return [...head, ...rest];
});

const brandOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [{ value: "", label: "— не задано —" }];
  const rest = brands.value.map((b) => ({
    value: String(b.id),
    label: b.name,
  }));
  return [...head, ...rest];
});

const categoryOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [{ value: "", label: "— не задана —" }];
  const rest = categories.value.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));
  return [...head, ...rest];
});

const selectedEditProduct = computed(() => {
  const raw = editProductId.value.trim();
  if (!raw) return null;
  const id = Number.parseInt(raw, 10);
  if (Number.isNaN(id)) return null;
  return products.value.find((p) => p.id === id) ?? null;
});

function appendUploadedUrls(target: Ref<string[]>, urls: string[]) {
  if (!urls.length) return;
  target.value = [...target.value, ...urls];
}

function removeUploadedUrlAt(target: Ref<string[]>, index: number) {
  target.value = target.value.filter((_, i) => i !== index);
}

function onEditProductImagesUploaded(urls: string[]) {
  appendUploadedUrls(editProductNewImageUrls, urls);
}

function removeEditNewProductImageAt(index: number) {
  removeUploadedUrlAt(editProductNewImageUrls, index);
}

function onEditProductPick(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v === undefined) return;
  editProductId.value = v;
  editProductNewImageUrls.value = [];
  if (!v) {
    editForm.title = "";
    editForm.slug = "";
    editForm.description = "";
    editForm.price = "";
    editForm.currency = DEFAULT_SHOP_CURRENCY;
    editForm.brand = "";
    editForm.category = "";
    return;
  }
  const p = products.value.find((x) => String(x.id) === v);
  if (!p) return;
  editForm.title = p.title;
  editForm.slug = p.slug;
  editForm.description = p.description ?? "";
  editForm.price = p.price;
  editForm.currency = normalizeShopCurrency(p.currency);
  editForm.brand = p.brandId != null ? String(p.brandId) : "";
  editForm.category = p.categoryId != null ? String(p.categoryId) : "";
}

function onEditTitleIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) editForm.title = v;
}
function onEditSlugIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) editForm.slug = v;
}
function onEditPriceIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) editForm.price = v;
}
function onEditCurrencyChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v === "GEL" || v === "USD") editForm.currency = v;
}

function onEditDescIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) editForm.description = v;
}
function onEditBrandChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) editForm.brand = v;
}
function onEditCategoryChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) editForm.category = v;
}

async function onUpdateProduct() {
  if (props.disabled || adminBusy.value) return;
  const id = editProductId.value
    ? Number.parseInt(editProductId.value, 10)
    : Number.NaN;
  if (!editProductId.value || Number.isNaN(id)) {
    return;
  }
  adminBusy.value = true;
  try {
    const brandId = editForm.brand ? Number.parseInt(editForm.brand, 10) : null;
    const categoryId = editForm.category
      ? Number.parseInt(editForm.category, 10)
      : null;
    const ok = await submitUpdateProduct(id, {
      title: editForm.title,
      slug: editForm.slug,
      description: editForm.description,
      price: editForm.price,
      currency: editForm.currency,
      brandId:
        editForm.brand && brandId != null && Number.isFinite(brandId)
          ? brandId
          : null,
      categoryId:
        editForm.category && categoryId != null && Number.isFinite(categoryId)
          ? categoryId
          : null,
    });
    if (ok) {
      const hadImages =
        (products.value.find((x) => x.id === id)?.images?.length ?? 0) > 0;
      if (editProductNewImageUrls.value.length) {
        const pending = [...editProductNewImageUrls.value];
        const imgOk = await submitAddProductImages(id, pending, {
          firstInBatchIsMain: !hadImages,
        });
        if (imgOk) editProductNewImageUrls.value = [];
      }
      await loadContext();
      editProductId.value = String(id);
      const p = products.value.find((x) => x.id === id);
      if (p) {
        editForm.title = p.title;
        editForm.slug = p.slug;
        editForm.description = p.description ?? "";
        editForm.price = p.price;
        editForm.currency = normalizeShopCurrency(p.currency);
        editForm.brand = p.brandId != null ? String(p.brandId) : "";
        editForm.category = p.categoryId != null ? String(p.categoryId) : "";
      }
    }
  } finally {
    adminBusy.value = false;
  }
}
</script>

<template>
  <div class="admin-tabs__panel" role="tabpanel">
    <div class="admin-section admin-section--panel">
      <h2 class="admin-section__heading">Изменить существующий товар</h2>
      <p class="admin-section__lede">
        Выберите товар, при необходимости измените поля и нажмите «Сохранить».
      </p>
      <label class="form-label form-label--full">
        <span>Товар</span>
        <vl-select
          wide
          :value="editProductId"
          :options="editProductOptions"
          @vl-change="onEditProductPick"
        />
      </label>
      <form class="form-grid" @submit.prevent="onUpdateProduct">
        <label class="form-label form-label--full">
          <vl-input
            :value="editForm.title"
            type="text"
            wide
            :disabled="!editProductId"
            placeholder="Название товара"
            @vl-input="onEditTitleIn"
          />
        </label>
        <label class="form-label form-label--full">
          <vl-input
            :value="editForm.slug"
            type="text"
            wide
            :disabled="!editProductId"
            placeholder="slug, kebab-case: a-z, 0-9, hyphens"
            @vl-input="onEditSlugIn"
          />
        </label>
        <label class="form-label">
          <vl-input
            :value="editForm.price"
            type="text"
            wide
            :disabled="!editProductId"
            placeholder="Цена, пример: 8500.00"
            @vl-input="onEditPriceIn"
          />
        </label>
        <label class="form-label">
          <span>Валюта</span>
          <vl-select
            wide
            :value="editForm.currency"
            :options="SHOP_CURRENCY_SELECT_OPTIONS"
            :disabled="!editProductId"
            @vl-change="onEditCurrencyChange"
          />
        </label>
        <label class="form-label">
          <span>Бренд</span>
          <vl-select
            wide
            :value="editForm.brand"
            :options="brandOptions"
            :disabled="!editProductId"
            @vl-change="onEditBrandChange"
          />
        </label>
        <label class="form-label">
          <span>Категория</span>
          <vl-select
            wide
            :value="editForm.category"
            :options="categoryOptions"
            :disabled="!editProductId"
            @vl-change="onEditCategoryChange"
          />
        </label>
        <div
          v-if="selectedEditProduct?.images?.length"
          class="form-label form-label--full"
        >
          <span>Текущие фото в каталоге</span>
          <ul class="admin-uploaded-list" role="list">
            <li
              v-for="im in selectedEditProduct.images"
              :key="im.id"
              class="admin-uploaded-list__item admin-uploaded-list__item--readonly"
            >
              <img
                class="admin-upload-thumb"
                :src="imagePreviewSrc(im.url)"
                alt=""
                width="72"
                height="72"
                loading="lazy"
              />
              <span v-if="im.isMain" class="admin-uploaded-list__badge"
                >главное</span
              >
            </li>
          </ul>
        </div>
        <div class="form-label form-label--full">
          <span>Добавить фото</span>
          <CabinetImageUpload
            :multiple="true"
            :disabled="disabled || !editProductId"
            @done="onEditProductImagesUploaded"
          />
          <ul
            v-if="editProductNewImageUrls.length"
            class="admin-uploaded-list"
            role="list"
          >
            <li
              v-for="(url, idx) in editProductNewImageUrls"
              :key="`${url}-${idx}`"
              class="admin-uploaded-list__item"
            >
              <img
                class="admin-upload-thumb"
                :src="imagePreviewSrc(url)"
                alt=""
                width="72"
                height="72"
                loading="lazy"
              />
              <vl-button
                type="button"
                :disabled="disabled"
                @click="removeEditNewProductImageAt(idx)"
              >
                Удалить
              </vl-button>
            </li>
          </ul>
          <p
            v-else-if="editProductId"
            class="admin-section__hint admin-section__hint--inline"
          >
            Новые файлы будут сохранены по кнопке «Сохранить». Если у товара ещё
            нет фото, первое из списка станет главным.
          </p>
        </div>
        <label class="form-label form-label--full">
          <span>Описание</span>
          <vl-input
            :value="editForm.description"
            type="text"
            wide
            :disabled="disabled || !editProductId"
            placeholder="Опционально, одна строка"
            @vl-input="onEditDescIn"
          />
        </label>
        <div class="form-label form-label--full">
          <vl-button type="submit" :disabled="disabled || !editProductId">
            Сохранить
          </vl-button>
        </div>
      </form>
    </div>
  </div>
</template>

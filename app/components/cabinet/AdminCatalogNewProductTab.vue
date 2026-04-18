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
  type ShopCurrency,
} from "~/constants/cabinetCatalog";
import { slugifyToKebabCase } from "~/utils/slugFromName";
import type { VlSelectOption } from "velair-ui";

const props = defineProps<{ disabled: boolean }>();
const adminBusy = inject(CabinetAdminBusyKey)!;

const { categories, brands, submitProduct, submitAddProductImages } =
  useAdminCatalog();
const imagePreviewSrc = useCabinetPublicFileUrl();

const productSlugManual = ref(false);

const productForm = reactive({
  title: "",
  slug: "",
  description: "",
  price: "",
  currency: DEFAULT_SHOP_CURRENCY as ShopCurrency,
  brand: "",
  category: "",
});

const productImageUrls = ref<string[]>([]);

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

function appendUploadedUrls(target: Ref<string[]>, urls: string[]) {
  if (!urls.length) return;
  target.value = [...target.value, ...urls];
}

function removeUploadedUrlAt(target: Ref<string[]>, index: number) {
  target.value = target.value.filter((_, i) => i !== index);
}

function onProductImagesUploaded(urls: string[]) {
  appendUploadedUrls(productImageUrls, urls);
}

function removeProductImageAt(index: number) {
  removeUploadedUrlAt(productImageUrls, index);
}

function onProdTitleIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) productForm.title = v;
  if (!productSlugManual.value) {
    productForm.slug = slugifyToKebabCase(productForm.title);
  }
}
function onProdSlugIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v === undefined) return;
  productForm.slug = v;
  productSlugManual.value = Boolean(String(v).trim());
}
function onProdPriceIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) productForm.price = v;
}
function onProductCurrencyChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v === "GEL" || v === "USD") productForm.currency = v;
}

function onProdDescIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) productForm.description = v;
}

function onProductBrandChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) productForm.brand = v;
}

function onProductCategoryChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) productForm.category = v;
}

async function onCreateProduct() {
  if (props.disabled || adminBusy.value) return;
  adminBusy.value = true;
  try {
    const brandId = productForm.brand
      ? Number.parseInt(productForm.brand, 10)
      : null;
    const categoryId = productForm.category
      ? Number.parseInt(productForm.category, 10)
      : null;
    const productId = await submitProduct({
      title: productForm.title,
      slug: productForm.slug,
      description: productForm.description,
      price: productForm.price,
      currency: productForm.currency,
      brandId:
        productForm.brand && Number.isFinite(brandId as number)
          ? (brandId as number)
          : null,
      categoryId:
        productForm.category && Number.isFinite(categoryId as number)
          ? (categoryId as number)
          : null,
    });
    if (productId == null) return;
    if (productImageUrls.value.length) {
      const urls = [...productImageUrls.value];
      const imgOk = await submitAddProductImages(productId, urls, {
        firstInBatchIsMain: true,
      });
      if (!imgOk) return;
    }
    productForm.title = "";
    productForm.slug = "";
    productForm.description = "";
    productForm.price = "";
    productForm.currency = DEFAULT_SHOP_CURRENCY;
    productForm.brand = "";
    productForm.category = "";
    productImageUrls.value = [];
    productSlugManual.value = false;
  } finally {
    adminBusy.value = false;
  }
}
</script>

<template>
  <div class="admin-tabs__panel" role="tabpanel">
    <div class="admin-section admin-section--panel">
      <h2 class="admin-section__heading">Создать товар</h2>
      <form class="form-grid" @submit.prevent="onCreateProduct">
        <label class="form-label form-label--full">
          <vl-input
            :value="productForm.title"
            type="text"
            wide
            placeholder="Название товара"
            @vl-input="onProdTitleIn"
          />
        </label>
        <label class="form-label form-label--full">
          <vl-input
            :value="productForm.slug"
            type="text"
            wide
            placeholder="slug, kebab-case: a-z, 0-9, hyphens"
            @vl-input="onProdSlugIn"
          />
        </label>
        <label class="form-label">
          <vl-input
            :value="productForm.price"
            type="text"
            wide
            placeholder="Цена"
            @vl-input="onProdPriceIn"
          />
        </label>
        <label class="form-label">
          <span>Валюта</span>
          <vl-select
            wide
            :value="productForm.currency"
            :options="SHOP_CURRENCY_SELECT_OPTIONS"
            @vl-change="onProductCurrencyChange"
          />
        </label>
        <label class="form-label">
          <span>Бренд</span>
          <vl-select
            wide
            :value="productForm.brand"
            :options="brandOptions"
            @vl-change="onProductBrandChange"
          />
        </label>
        <label class="form-label">
          <span>Категория</span>
          <vl-select
            wide
            :value="productForm.category"
            :options="categoryOptions"
            @vl-change="onProductCategoryChange"
          />
        </label>
        <div class="form-label form-label--full">
          <span>Фотографии товара</span>
          <CabinetImageUpload
            :multiple="true"
            :disabled="disabled"
            @done="onProductImagesUploaded"
          />
          <ul
            v-if="productImageUrls.length"
            class="admin-uploaded-list"
            role="list"
          >
            <li
              v-for="(url, idx) in productImageUrls"
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
              <span v-if="idx === 0" class="admin-uploaded-list__badge"
                >главное</span
              >
              <vl-button
                type="button"
                :disabled="disabled"
                @click="removeProductImageAt(idx)"
              >
                Удалить
              </vl-button>
            </li>
          </ul>
          <p v-else class="admin-section__hint admin-section__hint--inline">
            Можно выбрать несколько файлов подряд. Первое фото станет главным.
          </p>
        </div>
        <label class="form-label form-label--full">
          <vl-input
            :value="productForm.description"
            type="text"
            wide
            :disabled="disabled"
            placeholder="Описание товара"
            @vl-input="onProdDescIn"
          />
        </label>
        <div class="form-label form-label--full">
          <vl-button type="submit" :disabled="disabled">
            Создать товар
          </vl-button>
        </div>
      </form>
    </div>
  </div>
</template>

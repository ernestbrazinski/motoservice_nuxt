<script setup lang="ts">
import type { Ref } from "vue";
import { computed, inject, reactive, ref, watch } from "vue";
import { useAdminCatalog } from "~/composables/useAdminCatalog";
import CabinetImageUpload from "./CabinetImageUpload.vue";
import { useCabinetPublicFileUrl } from "~/composables/useCabinetPublicFileUrl";
import {
  CabinetAdminBusyKey,
  CabinetAdminPendingEditProductIdKey,
} from "~/constants/cabinetInjection";
import {
  DEFAULT_SHOP_CURRENCY,
  SHOP_CURRENCY_SELECT_OPTIONS,
  normalizeShopCurrency,
  type ShopCurrency,
} from "~/constants/cabinetCatalog";
import { slugifyToKebabCase } from "~/utils/slugFromName";
import type { VlSelectOption } from "velair-ui";

const props = defineProps<{ disabled: boolean }>();
const adminBusy = inject(CabinetAdminBusyKey)!;
const pendingEditProductId = inject(
  CabinetAdminPendingEditProductIdKey,
  ref<number | null>(null),
);

const {
  categories,
  brands,
  products,
  loadContext,
  submitProduct,
  submitAddProductImages,
  submitUpdateProduct,
} = useAdminCatalog();
const imagePreviewSrc = useCabinetPublicFileUrl();

const productSlugManual = ref(false);

/** Empty string = create new product; otherwise editing that product id. */
const selectedProductId = ref("");

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

const isEditMode = computed(() => Boolean(selectedProductId.value.trim()));

const productPickerOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [{ value: "", label: "— новый товар —" }];
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

const selectedCatalogProduct = computed(() => {
  const raw = selectedProductId.value.trim();
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

function onProductImagesUploaded(urls: string[]) {
  appendUploadedUrls(productImageUrls, urls);
}

function removeProductImageAt(index: number) {
  removeUploadedUrlAt(productImageUrls, index);
}

function applyProductSelection(productIdStr: string) {
  selectedProductId.value = productIdStr;
  productImageUrls.value = [];
  if (!productIdStr) {
    productForm.title = "";
    productForm.slug = "";
    productForm.description = "";
    productForm.price = "";
    productForm.currency = DEFAULT_SHOP_CURRENCY;
    productForm.brand = "";
    productForm.category = "";
    productSlugManual.value = false;
    return;
  }
  const p = products.value.find((x) => String(x.id) === productIdStr);
  if (!p) return;
  productForm.title = p.title;
  productForm.slug = p.slug;
  productForm.description = p.description ?? "";
  productForm.price = p.price;
  productForm.currency = normalizeShopCurrency(p.currency);
  productForm.brand = p.brandId != null ? String(p.brandId) : "";
  productForm.category = p.categoryId != null ? String(p.categoryId) : "";
  productSlugManual.value = true;
}

function onProductPick(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v === undefined) return;
  applyProductSelection(v);
}

watch(
  pendingEditProductId,
  (id) => {
    if (id == null) return;
    applyProductSelection(String(id));
    pendingEditProductId.value = null;
  },
  { flush: "post" },
);

function onProdTitleIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) productForm.title = v;
  if (!isEditMode.value && !productSlugManual.value) {
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

async function onUpdateProduct() {
  if (props.disabled || adminBusy.value) return;
  const id = selectedProductId.value
    ? Number.parseInt(selectedProductId.value, 10)
    : Number.NaN;
  if (!selectedProductId.value || Number.isNaN(id)) {
    return;
  }
  adminBusy.value = true;
  try {
    const brandId = productForm.brand
      ? Number.parseInt(productForm.brand, 10)
      : null;
    const categoryId = productForm.category
      ? Number.parseInt(productForm.category, 10)
      : null;
    const ok = await submitUpdateProduct(id, {
      title: productForm.title,
      slug: productForm.slug,
      description: productForm.description,
      price: productForm.price,
      currency: productForm.currency,
      brandId:
        productForm.brand && brandId != null && Number.isFinite(brandId)
          ? brandId
          : null,
      categoryId:
        productForm.category &&
        categoryId != null &&
        Number.isFinite(categoryId)
          ? categoryId
          : null,
    });
    if (ok) {
      const hadImages =
        (products.value.find((x) => x.id === id)?.images?.length ?? 0) > 0;
      if (productImageUrls.value.length) {
        const pending = [...productImageUrls.value];
        const imgOk = await submitAddProductImages(id, pending, {
          firstInBatchIsMain: !hadImages,
        });
        if (imgOk) productImageUrls.value = [];
      }
      await loadContext();
      selectedProductId.value = String(id);
      const p = products.value.find((x) => x.id === id);
      if (p) {
        productForm.title = p.title;
        productForm.slug = p.slug;
        productForm.description = p.description ?? "";
        productForm.price = p.price;
        productForm.currency = normalizeShopCurrency(p.currency);
        productForm.brand = p.brandId != null ? String(p.brandId) : "";
        productForm.category = p.categoryId != null ? String(p.categoryId) : "";
      }
    }
  } finally {
    adminBusy.value = false;
  }
}

async function onSubmitProduct() {
  if (isEditMode.value) {
    await onUpdateProduct();
  } else {
    await onCreateProduct();
  }
}
</script>

<template>
  <div class="admin-tabs__panel" role="tabpanel">
    <div class="admin-section admin-section--panel">
      <h2 class="admin-section__heading">Создать или изменить товар</h2>
      <p class="admin-section__lede">
        Выберите существующий товар для правки или оставьте «новый товар», чтобы
        создать запись в каталоге.
      </p>
      <label class="form-label form-label--full mb-16">
        <span>Товар</span>
        <vl-select
          wide
          :value="selectedProductId"
          :options="productPickerOptions"
          @vl-change="onProductPick"
        />
      </label>
      <form class="form-admin" @submit.prevent="onSubmitProduct">
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
        <div
          v-if="selectedCatalogProduct?.images?.length"
          class="form-label form-label--full"
        >
          <span>Текущие фото в каталоге</span>
          <ul class="admin-uploaded-list" role="list">
            <li
              v-for="im in selectedCatalogProduct.images"
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
          <span>{{ isEditMode ? "Добавить фото" : "Фотографии товара" }}</span>
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
              <span v-if="idx === 0" class="admin-uploaded-list__badge">{{
                isEditMode ? "новое" : "главное"
              }}</span>
              <vl-button
                type="button"
                :disabled="disabled"
                @click="removeProductImageAt(idx)"
              >
                Удалить
              </vl-button>
            </li>
          </ul>
          <p
            v-else-if="isEditMode && selectedProductId"
            class="admin-section__hint admin-section__hint--inline"
          >
            Новые файлы сохраняются по кнопке «Сохранить». Если у товара ещё нет
            фото, первое из списка станет главным.
          </p>
          <p
            v-else-if="!isEditMode"
            class="admin-section__hint admin-section__hint--inline"
          >
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
            {{ isEditMode ? "Сохранить" : "Создать товар" }}
          </vl-button>
        </div>
      </form>
    </div>
  </div>
</template>

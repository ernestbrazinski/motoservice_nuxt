<script setup lang="ts">
import type { Ref } from "vue";
import { computed, onMounted, reactive, ref } from "vue";
import { useAdminCatalog } from "~/composables/useAdminCatalog";
import { useCabinetToast } from "~/composables/useCabinetToast";
import CabinetImageUpload from "./CabinetImageUpload.vue";
import { cabinetPublicFileUrl } from "~/utils/cabinet-upload";
import { slugifyToKebabCase } from "~/utils/slugFromName";
import type { VlSelectOption } from "velair-ui";

const { show: toastCabinet } = useCabinetToast();
const runtimeConfig = useRuntimeConfig();

function imagePreviewSrc(publicPath: string): string {
  const graphqlUrl = (runtimeConfig.public.graphqlUrl as string)?.trim() || "";
  return cabinetPublicFileUrl(graphqlUrl, publicPath);
}

const {
  categories,
  brands,
  tags,
  products,
  contextLoading,
  contextError,
  loadContext,
  slugHint,
  submitCategory,
  submitBrand,
  submitTag,
  submitProduct,
  submitAddProductImages,
  submitUpdateProduct,
  submitLinkTag,
  submitMotorcycleListing,
  submitMotorcycleListingImage,
  orders,
  ordersLoading,
  loadOrders,
} = useAdminCatalog();

const busy = ref(false);

/** Slug не перезаписывается из названия, пока пользователь не правил поле slug вручную (или не очистил его). */
const categorySlugManual = ref(false);
const brandSlugManual = ref(false);
const productSlugManual = ref(false);

/** Top-level admin tabs: reference data, products, motorcycle listing. */
const adminTab = ref<
  "refs" | "newProduct" | "editProduct" | "motorcycle"
>("refs");

const categoryForm = reactive({
  name: "",
  slug: "",
  parent: "",
});
const brandForm = reactive({ name: "", slug: "", logoUrl: "" });
const tagForm = reactive({ name: "" });
const productForm = reactive({
  title: "",
  slug: "",
  description: "",
  price: "",
  currency: "GEL",
  brand: "",
  category: "",
});
const linkForm = reactive({ product: "", tag: "" });

const bikeForm = reactive({
  brand: "",
  model: "",
  year: "",
  mileage: "",
  mileageUnit: "KM" as "KM" | "MI",
  vin: "",
  price: "",
  currency: "EUR",
  description: "",
});

/** Uploaded listing image paths (`/upload/…`), first = main photo. */
const bikePhotoUrls = ref<string[]>([]);
const productImageUrls = ref<string[]>([]);
const editProductNewImageUrls = ref<string[]>([]);

const editProductId = ref("");
const editForm = reactive({
  title: "",
  slug: "",
  description: "",
  price: "",
  currency: "GEL",
  brand: "",
  category: "",
});

const parentOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [
    { value: "", label: "— без родителя —" },
  ];
  const rest = categories.value.map((c) => ({
    value: String(c.id),
    label: `${c.name} (${c.slug})`,
  }));
  return [...head, ...rest];
});

const brandOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [
    { value: "", label: "— не задано —" },
  ];
  const rest = brands.value.map((b) => ({
    value: String(b.id),
    label: b.name,
  }));
  return [...head, ...rest];
});

const categoryOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [
    { value: "", label: "— не задана —" },
  ];
  const rest = categories.value.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));
  return [...head, ...rest];
});

const productOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [
    { value: "", label: "Выберите товар", disabled: true },
  ];
  const rest = products.value.map((p) => ({
    value: String(p.id),
    label: `${p.title} (#${p.id})`,
  }));
  return [...head, ...rest];
});

const editProductOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [
    { value: "", label: "— выберите товар —" },
  ];
  const rest = products.value.map((p) => ({
    value: String(p.id),
    label: `${p.title} (#${p.id})`,
  }));
  return [...head, ...rest];
});

const tagOptions = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [
    { value: "", label: "Выберите тег", disabled: true },
  ];
  const rest = tags.value.map((t) => ({
    value: String(t.id),
    label: t.name,
  }));
  return [...head, ...rest];
});

const brandOptionsRequired = computed((): VlSelectOption[] => {
  const head: VlSelectOption[] = [
    { value: "", label: "— выберите бренд —", disabled: true },
  ];
  const rest = brands.value.map((b) => ({
    value: String(b.id),
    label: b.name,
  }));
  return [...head, ...rest];
});

const mileageUnitSelectOptions: VlSelectOption[] = [
  { value: "KM", label: "км" },
  { value: "MI", label: "мили" },
];

onMounted(() => {
  void loadContext();
});

function onCategoryParentChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) categoryForm.parent = v;
}

function onProductBrandChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) productForm.brand = v;
}

function onProductCategoryChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) productForm.category = v;
}

function onLinkProductChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) linkForm.product = v;
}

function onLinkTagChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) linkForm.tag = v;
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

function onEditProductImagesUploaded(urls: string[]) {
  appendUploadedUrls(editProductNewImageUrls, urls);
}

function onBikePhotosUploaded(urls: string[]) {
  appendUploadedUrls(bikePhotoUrls, urls);
}

function removeProductImageAt(index: number) {
  removeUploadedUrlAt(productImageUrls, index);
}

function removeEditNewProductImageAt(index: number) {
  removeUploadedUrlAt(editProductNewImageUrls, index);
}

function removeBikePhotoAt(index: number) {
  removeUploadedUrlAt(bikePhotoUrls, index);
}
function onTagNameIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) tagForm.name = v;
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
function onProdCurIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) productForm.currency = v;
}

function onProdDescIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) productForm.description = v;
}

const selectedEditProduct = computed(() => {
  const raw = editProductId.value.trim();
  if (!raw) return null;
  const id = Number.parseInt(raw, 10);
  if (Number.isNaN(id)) return null;
  return products.value.find((p) => p.id === id) ?? null;
});

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
    editForm.currency = "GEL";
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
  editForm.currency = p.currency;
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
function onEditCurIn(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) editForm.currency = v;
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

async function onCreateCategory() {
  if (busy.value) return;
  busy.value = true;
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
    busy.value = false;
  }
}

async function onCreateBrand() {
  if (busy.value) return;
  busy.value = true;
  try {
    const ok = await submitBrand(brandForm);
    if (ok) {
      brandForm.name = "";
      brandForm.slug = "";
      brandForm.logoUrl = "";
      brandSlugManual.value = false;
    }
  } finally {
    busy.value = false;
  }
}

async function onCreateTag() {
  if (busy.value) return;
  busy.value = true;
  try {
    const ok = await submitTag(tagForm.name);
    if (ok) tagForm.name = "";
  } finally {
    busy.value = false;
  }
}

async function onCreateProduct() {
  if (busy.value) return;
  busy.value = true;
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
    productForm.currency = "GEL";
    productForm.brand = "";
    productForm.category = "";
    productImageUrls.value = [];
    productSlugManual.value = false;
  } finally {
    busy.value = false;
  }
}

async function onUpdateProduct() {
  if (busy.value) return;
  const id = editProductId.value
    ? Number.parseInt(editProductId.value, 10)
    : Number.NaN;
  if (!editProductId.value || Number.isNaN(id)) {
    return;
  }
  busy.value = true;
  try {
    const brandId = editForm.brand
      ? Number.parseInt(editForm.brand, 10)
      : null;
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
        editForm.currency = p.currency;
        editForm.brand = p.brandId != null ? String(p.brandId) : "";
        editForm.category = p.categoryId != null ? String(p.categoryId) : "";
      }
    }
  } finally {
    busy.value = false;
  }
}

async function onLink() {
  if (busy.value) return;
  busy.value = true;
  try {
    const productId = linkForm.product
      ? Number.parseInt(linkForm.product, 10)
      : null;
    const tagId = linkForm.tag ? Number.parseInt(linkForm.tag, 10) : null;
    const ok = await submitLinkTag(
      productId && Number.isFinite(productId) ? productId : null,
      tagId && Number.isFinite(tagId) ? tagId : null,
    );
    if (ok) {
      linkForm.product = "";
      linkForm.tag = "";
    }
  } finally {
    busy.value = false;
  }
}

function onBikeBrandChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) bikeForm.brand = v;
}

function onBikeMileageUnitChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v === "KM" || v === "MI") bikeForm.mileageUnit = v;
}

function onBikeStr(
  field:
    | "model"
    | "year"
    | "mileage"
    | "vin"
    | "price"
    | "currency"
    | "description",
  e: Event,
) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) (bikeForm as Record<string, string>)[field] = v;
}

function onBikeModelIn(e: Event) {
  onBikeStr("model", e);
}
function onBikeYearIn(e: Event) {
  onBikeStr("year", e);
}
function onBikeMileageIn(e: Event) {
  onBikeStr("mileage", e);
}
function onBikeVinIn(e: Event) {
  onBikeStr("vin", e);
}
function onBikePriceIn(e: Event) {
  onBikeStr("price", e);
}
function onBikeCurrencyIn(e: Event) {
  onBikeStr("currency", e);
}

function onBikeDescriptionIn(e: Event) {
  onBikeStr("description", e);
}

async function onCreateMotorcycleListing() {
  if (busy.value) return;
  const brandId = bikeForm.brand
    ? Number.parseInt(bikeForm.brand, 10)
    : Number.NaN;
  if (!bikeForm.brand || Number.isNaN(brandId)) {
    toastCabinet("error", "Выберите бренд");
    return;
  }
  const year = Number.parseInt(bikeForm.year, 10);
  const mileage = Number.parseInt(bikeForm.mileage, 10);
  busy.value = true;
  try {
    const listingId = await submitMotorcycleListing({
      brandId,
      model: bikeForm.model,
      year,
      mileage,
      mileageUnit: bikeForm.mileageUnit,
      vin: bikeForm.vin,
      price: bikeForm.price,
      currency: bikeForm.currency,
      description: bikeForm.description || null,
    });
    if (listingId == null) return;
    const urls = [...bikePhotoUrls.value];
    const photos = urls.map((url, i) => ({
      url,
      isMain: i === 0,
      sortOrder: i,
    }));
    for (const p of photos) {
      const ok = await submitMotorcycleListingImage({
        listingId,
        url: p.url,
        isMain: p.isMain,
        sortOrder: p.sortOrder,
      });
      if (!ok) return;
    }
    if (photos.length) {
      toastCabinet("success", "Фото добавлены к объявлению");
    }
    bikeForm.brand = "";
    bikeForm.model = "";
    bikeForm.year = "";
    bikeForm.mileage = "";
    bikeForm.mileageUnit = "KM";
    bikeForm.vin = "";
    bikeForm.price = "";
    bikeForm.currency = "EUR";
    bikeForm.description = "";
    bikePhotoUrls.value = [];
  } finally {
    busy.value = false;
  }
}

const disabled = computed(
  () => busy.value || contextLoading.value,
);

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU");
  } catch {
    return iso;
  }
}
</script>

<template>
  <div class="admin-blocks">
    <p v-if="contextLoading" class="admin-blocks__state">Загрузка справочников…</p>
    <p v-else-if="contextError" class="admin-blocks__state form__error">
      {{ contextError }}
      <vl-button type="button" @click="loadContext"> Повторить </vl-button>
    </p>

    <p class="admin-blocks__upload-hint" role="note">
      Изображения: кнопка загрузки отправляет файл на API (superadmin); в
      каталоге сохраняется путь вида <code>/upload/…</code>.
    </p>

    <div
      class="admin-tabs"
      role="tablist"
      aria-label="Разделы кабинета"
    >
      <button
        type="button"
        class="admin-tabs__tab"
        role="tab"
        :aria-selected="adminTab === 'refs'"
        @click="adminTab = 'refs'"
      >
        Справочники
      </button>
      <button
        type="button"
        class="admin-tabs__tab"
        role="tab"
        :aria-selected="adminTab === 'newProduct'"
        @click="adminTab = 'newProduct'"
      >
        Новый товар
      </button>
      <button
        type="button"
        class="admin-tabs__tab"
        role="tab"
        :aria-selected="adminTab === 'editProduct'"
        @click="adminTab = 'editProduct'"
      >
        Редактирование товара
      </button>
      <button
        type="button"
        class="admin-tabs__tab"
        role="tab"
        :aria-selected="adminTab === 'motorcycle'"
        @click="adminTab = 'motorcycle'"
      >
        Мотоцикл (объявление)
      </button>
    </div>

    <div
      v-show="adminTab === 'refs'"
      class="admin-tabs__panel"
      role="tabpanel"
    >
    <details class="admin-section" open>
      <summary>Категория</summary>
      <form class="form-grid" @submit.prevent="onCreateCategory">
        <label class="form-label">
          <span>Название</span>
          <vl-input
            :value="categoryForm.name"
            type="text"
            wide
            @vl-input="onCatNameIn"
          />
        </label>
        <label class="form-label">
          <span>Slug <small class="text-muted">({{ slugHint() }})</small></span>
          <vl-input
            :value="categoryForm.slug"
            type="text"
            wide
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
          <span>Название</span>
          <vl-input
            :value="brandForm.name"
            type="text"
            wide
            @vl-input="onBrandNameIn"
          />
        </label>
        <label class="form-label">
          <span>Slug <small class="text-muted">({{ slugHint() }})</small></span>
          <vl-input
            :value="brandForm.slug"
            type="text"
            wide
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
          <vl-button type="submit" :disabled="disabled">
            Создать бренд
          </vl-button>
        </div>
      </form>
    </details>

    <details class="admin-section" open>
      <summary>Тег</summary>
      <form
        class="form-grid form-grid--stack gap-16"
        @submit.prevent="onCreateTag"
      >
        <label class="form-label">
          <span>Название</span>
          <vl-input
            :value="tagForm.name"
            type="text"
            wide
            @vl-input="onTagNameIn"
          />
        </label>
        <div>
          <vl-button type="submit" :disabled="disabled">Создать тег</vl-button>
        </div>
      </form>
    </details>

    <details class="admin-section" open>
      <summary>Товар + тег</summary>
      <form class="form-grid" @submit.prevent="onLink">
        <label class="form-label">
          <span>Товар</span>
          <vl-select
            wide
            :value="linkForm.product"
            :options="productOptions"
            @vl-change="onLinkProductChange"
          />
        </label>
        <label class="form-label">
          <span>Тег</span>
          <vl-select
            wide
            :value="linkForm.tag"
            :options="tagOptions"
            @vl-change="onLinkTagChange"
          />
        </label>
        <div class="form-label form-label--full">
          <vl-button type="submit" :disabled="disabled">Связать</vl-button>
        </div>
      </form>
    </details>

    <details class="admin-section">
      <summary>Заказы (только чтение)</summary>
      <p class="admin-blocks__state">
        <vl-button
          type="button"
          :disabled="ordersLoading"
          @click="loadOrders"
        >
          {{ ordersLoading ? "Загрузка…" : "Загрузить заказы" }}
        </vl-button>
      </p>
      <ul v-if="orders.length" class="order-list" role="list">
        <li
          v-for="o in orders"
          :key="o.id"
          class="order-list__item"
        >
          <h3 class="order-list__id">
            #{{ o.id }} · <span v-if="o.status">{{ o.status }}</span>
          </h3>
          <p class="order-list__meta">
            {{ formatDate(o.createdAt) }} ·
            <span
              v-if="o.totalPrice != null && o.totalPrice !== ''"
            >{{ o.totalPrice }}</span>
          </p>
          <p v-if="o.customerName || o.customerEmail || o.customerPhone">
            {{ o.customerName }}
            <template v-if="o.customerEmail">, {{ o.customerEmail }}</template>
            <template v-if="o.customerPhone">, {{ o.customerPhone }}</template>
          </p>
          <ul v-if="o.items?.length" class="order-list__items">
            <li v-for="it in o.items" :key="it.id">
              #{{ it.id }} — qty {{ it.quantity }}, price
              {{ it.price }}, product
              {{ it.productId }} / var {{ it.variantId }}
            </li>
          </ul>
        </li>
      </ul>
    </details>
    </div>

    <div
      v-show="adminTab === 'newProduct'"
      class="admin-tabs__panel"
      role="tabpanel"
    >
    <div class="admin-section admin-section--panel">
      <h2 class="admin-section__heading">Создать товар</h2>
      <form class="form-grid" @submit.prevent="onCreateProduct">
        <label class="form-label form-label--full">
          <span>Название</span>
          <vl-input
            :value="productForm.title"
            type="text"
            wide
            @vl-input="onProdTitleIn"
          />
        </label>
        <label class="form-label form-label--full">
          <span>Slug <small class="text-muted">({{ slugHint() }})</small></span>
          <vl-input
            :value="productForm.slug"
            type="text"
            wide
            @vl-input="onProdSlugIn"
          />
        </label>
        <label class="form-label">
          <span>Цена (строка, как в БД)</span>
          <vl-input
            :value="productForm.price"
            type="text"
            wide
            @vl-input="onProdPriceIn"
          />
        </label>
        <label class="form-label">
          <span>Валюта</span>
          <vl-input
            :value="productForm.currency"
            type="text"
            wide
            @vl-input="onProdCurIn"
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
              <span v-if="idx === 0" class="admin-uploaded-list__badge">главное</span>
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
          <span>Описание</span>
          <vl-input
            :value="productForm.description"
            type="text"
            wide
            :disabled="disabled"
            placeholder="Опционально, одна строка"
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

    <div
      v-show="adminTab === 'editProduct'"
      class="admin-tabs__panel"
      role="tabpanel"
    >
    <div class="admin-section admin-section--panel">
      <h2 class="admin-section__heading">Изменить существующий товар</h2>
      <p class="admin-section__lede">
        Выберите товар, при необходимости измените поля и нажмите
        «Сохранить».
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
          <span>Название</span>
          <vl-input
            :value="editForm.title"
            type="text"
            wide
            :disabled="!editProductId"
            @vl-input="onEditTitleIn"
          />
        </label>
        <label class="form-label form-label--full">
          <span>Slug <small class="text-muted">({{ slugHint() }})</small></span>
          <vl-input
            :value="editForm.slug"
            type="text"
            wide
            :disabled="!editProductId"
            @vl-input="onEditSlugIn"
          />
        </label>
        <label class="form-label">
          <span>Цена (строка, как в БД)</span>
          <vl-input
            :value="editForm.price"
            type="text"
            wide
            :disabled="!editProductId"
            @vl-input="onEditPriceIn"
          />
        </label>
        <label class="form-label">
          <span>Валюта</span>
          <vl-input
            :value="editForm.currency"
            type="text"
            wide
            :disabled="!editProductId"
            @vl-input="onEditCurIn"
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
              <span v-if="im.isMain" class="admin-uploaded-list__badge">главное</span>
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
            Новые файлы будут сохранены по кнопке «Сохранить». Если у товара
            ещё нет фото, первое из списка станет главным.
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
          <vl-button
            type="submit"
            :disabled="disabled || !editProductId"
          >
            Сохранить
          </vl-button>
        </div>
      </form>
    </div>
    </div>

    <div
      v-show="adminTab === 'motorcycle'"
      class="admin-tabs__panel"
      role="tabpanel"
    >
      <div class="admin-section admin-section--panel">
        <h2 class="admin-section__heading">Объявление: мотоцикл на продажу</h2>
        <p class="admin-section__hint">
          Несколько фото: загружайте по одному или выберите несколько сразу.
          Первое в списке — главное фото объявления.
        </p>
        <form class="form-grid" @submit.prevent="onCreateMotorcycleListing">
          <label class="form-label form-label--full">
            <span>Бренд</span>
            <vl-select
              wide
              :value="bikeForm.brand"
              :options="brandOptionsRequired"
              @vl-change="onBikeBrandChange"
            />
          </label>
          <label class="form-label form-label--full">
            <span>Модель</span>
            <vl-input
              :value="bikeForm.model"
              type="text"
              wide
              @vl-input="onBikeModelIn"
            />
          </label>
          <label class="form-label">
            <span>Год</span>
            <vl-input
              :value="bikeForm.year"
              type="number"
              wide
              @vl-input="onBikeYearIn"
            />
          </label>
          <label class="form-label">
            <span>Пробег</span>
            <vl-input
              :value="bikeForm.mileage"
              type="number"
              wide
              @vl-input="onBikeMileageIn"
            />
          </label>
          <label class="form-label form-label--full">
            <span>Единица пробега</span>
            <vl-select
              wide
              :value="bikeForm.mileageUnit"
              :options="mileageUnitSelectOptions"
              @vl-change="onBikeMileageUnitChange"
            />
          </label>
          <label class="form-label form-label--full">
            <span>VIN (5–32 символа)</span>
            <vl-input
              :value="bikeForm.vin"
              type="text"
              wide
              autocomplete="off"
              @vl-input="onBikeVinIn"
            />
          </label>
          <label class="form-label">
            <span>Цена</span>
            <vl-input
              :value="bikeForm.price"
              type="text"
              wide
              placeholder="8500.00"
              @vl-input="onBikePriceIn"
            />
          </label>
          <label class="form-label">
            <span>Валюта</span>
            <vl-input
              :value="bikeForm.currency"
              type="text"
              wide
              @vl-input="onBikeCurrencyIn"
            />
          </label>
          <div class="form-label form-label--full cabinet-photo-row">
            <span>Фото</span>
            <CabinetImageUpload
              :multiple="true"
              :disabled="disabled"
              @done="onBikePhotosUploaded"
            />
            <ul
              v-if="bikePhotoUrls.length"
              class="admin-uploaded-list"
              role="list"
            >
              <li
                v-for="(url, idx) in bikePhotoUrls"
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
                <span v-if="idx === 0" class="admin-uploaded-list__badge">главное</span>
                <vl-button
                  type="button"
                  :disabled="disabled"
                  @click="removeBikePhotoAt(idx)"
                >
                  Удалить
                </vl-button>
              </li>
            </ul>
          </div>
          <label class="form-label form-label--full">
            <span>Описание</span>
            <vl-input
              :value="bikeForm.description"
              type="text"
              wide
              :disabled="disabled"
              placeholder="Опционально, одна строка"
              @vl-input="onBikeDescriptionIn"
            />
          </label>
          <div class="form-label form-label--full">
            <vl-button type="submit" :disabled="disabled">
              Создать объявление и фото
            </vl-button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

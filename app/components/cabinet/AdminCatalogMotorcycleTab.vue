<script setup lang="ts">
import type { Ref } from "vue";
import { computed, inject, reactive, ref } from "vue";
import { useAdminCatalog } from "~/composables/useAdminCatalog";
import { useCabinetToast } from "~/composables/useCabinetToast";
import CabinetImageUpload from "./CabinetImageUpload.vue";
import { useCabinetPublicFileUrl } from "~/composables/useCabinetPublicFileUrl";
import { CabinetAdminBusyKey } from "~/constants/cabinetInjection";
import {
  DEFAULT_MILEAGE_UNIT,
  DEFAULT_SHOP_CURRENCY,
  DISPLACEMENT_CC_MAX,
  DISPLACEMENT_CC_MIN,
  MILEAGE_UNIT_SELECT_OPTIONS,
  SHOP_CURRENCY_SELECT_OPTIONS,
  isMileageUnitUi,
  type MileageUnitUi,
  type ShopCurrency,
} from "~/constants/cabinetCatalog";
import type { VlSelectOption } from "velair-ui";

const props = defineProps<{ disabled: boolean }>();
const adminBusy = inject(CabinetAdminBusyKey)!;

const { show: toastCabinet } = useCabinetToast();
const { brands, submitMotorcycleListing, submitMotorcycleListingImage } =
  useAdminCatalog();
const imagePreviewSrc = useCabinetPublicFileUrl();

const bikeForm = reactive({
  brand: "",
  model: "",
  year: "",
  displacementCc: "",
  mileage: "",
  mileageUnit: DEFAULT_MILEAGE_UNIT as MileageUnitUi,
  vin: "",
  price: "",
  currency: DEFAULT_SHOP_CURRENCY as ShopCurrency,
  description: "",
});

const bikePhotoUrls = ref<string[]>([]);

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

function appendUploadedUrls(target: Ref<string[]>, urls: string[]) {
  if (!urls.length) return;
  target.value = [...target.value, ...urls];
}

function removeUploadedUrlAt(target: Ref<string[]>, index: number) {
  target.value = target.value.filter((_, i) => i !== index);
}

function onBikePhotosUploaded(urls: string[]) {
  appendUploadedUrls(bikePhotoUrls, urls);
}

function removeBikePhotoAt(index: number) {
  removeUploadedUrlAt(bikePhotoUrls, index);
}

function onBikeBrandChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) bikeForm.brand = v;
}

function onBikeMileageUnitChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (isMileageUnitUi(v)) bikeForm.mileageUnit = v;
}

function onBikeStr(
  field:
    | "model"
    | "year"
    | "displacementCc"
    | "mileage"
    | "vin"
    | "price"
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
function onBikeDisplacementCcIn(e: Event) {
  onBikeStr("displacementCc", e);
}
function onBikeCurrencyChange(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v === "GEL" || v === "USD") bikeForm.currency = v;
}

function onBikeDescriptionIn(e: Event) {
  onBikeStr("description", e);
}

async function onCreateMotorcycleListing() {
  if (props.disabled || adminBusy.value) return;
  const brandId = bikeForm.brand
    ? Number.parseInt(bikeForm.brand, 10)
    : Number.NaN;
  if (!bikeForm.brand || Number.isNaN(brandId)) {
    toastCabinet("error", "Выберите бренд");
    return;
  }
  const year = Number.parseInt(bikeForm.year, 10);
  const mileage = Number.parseInt(bikeForm.mileage, 10);
  const dispRaw = bikeForm.displacementCc.trim();
  const displacementCc = Number.parseInt(dispRaw, 10);
  if (
    !dispRaw ||
    Number.isNaN(displacementCc) ||
    displacementCc < DISPLACEMENT_CC_MIN ||
    displacementCc > DISPLACEMENT_CC_MAX
  ) {
    toastCabinet(
      "error",
      `Укажите кубатуру (${DISPLACEMENT_CC_MIN}–${DISPLACEMENT_CC_MAX} см³)`,
    );
    return;
  }
  adminBusy.value = true;
  try {
    const listingId = await submitMotorcycleListing({
      brandId,
      model: bikeForm.model,
      year,
      displacementCc,
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
    bikeForm.displacementCc = "";
    bikeForm.mileage = "";
    bikeForm.mileageUnit = DEFAULT_MILEAGE_UNIT;
    bikeForm.vin = "";
    bikeForm.price = "";
    bikeForm.currency = DEFAULT_SHOP_CURRENCY;
    bikeForm.description = "";
    bikePhotoUrls.value = [];
  } finally {
    adminBusy.value = false;
  }
}
</script>

<template>
  <div class="admin-tabs__panel" role="tabpanel">
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
          <vl-input
            :value="bikeForm.model"
            type="text"
            wide
            placeholder="Название модели"
            @vl-input="onBikeModelIn"
          />
        </label>
        <label class="form-label">
          <vl-input
            :value="bikeForm.year"
            type="number"
            wide
            placeholder="Год выпуска"
            @vl-input="onBikeYearIn"
          />
        </label>
        <label class="form-label">
          <vl-input
            :value="bikeForm.displacementCc"
            type="number"
            wide
            placeholder="Кубатура, см³"
            @vl-input="onBikeDisplacementCcIn"
          />
        </label>
        <label class="form-label">
          <vl-input
            :value="bikeForm.mileage"
            type="number"
            wide
            placeholder="Пробег"
            @vl-input="onBikeMileageIn"
          />
        </label>
        <label class="form-label form-label--full">
          <span>Единица пробега</span>
          <vl-select
            wide
            :value="bikeForm.mileageUnit"
            :options="MILEAGE_UNIT_SELECT_OPTIONS"
            @vl-change="onBikeMileageUnitChange"
          />
        </label>
        <label class="form-label form-label--full">
          <vl-input
            :value="bikeForm.vin"
            type="text"
            wide
            autocomplete="off"
            placeholder="VIN (5–32 символов)"
            @vl-input="onBikeVinIn"
          />
        </label>
        <label class="form-label">
          <vl-input
            :value="bikeForm.price"
            type="text"
            wide
            placeholder="Цена, пример: 8500.00"
            @vl-input="onBikePriceIn"
          />
        </label>
        <label class="form-label">
          <span>Валюта</span>
          <vl-select
            wide
            :value="bikeForm.currency"
            :options="SHOP_CURRENCY_SELECT_OPTIONS"
            @vl-change="onBikeCurrencyChange"
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
              <span v-if="idx === 0" class="admin-uploaded-list__badge"
                >главное</span
              >
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
</template>

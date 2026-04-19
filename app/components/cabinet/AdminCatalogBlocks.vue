<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from "vue";
import {
  useAdminCatalog,
  type AdminBrand,
  type AdminCategory,
  type AdminMotorcycleListing,
  type AdminProduct,
} from "~/composables/useAdminCatalog";
import { useCabinetPublicFileUrl } from "~/composables/useCabinetPublicFileUrl";
import {
  CABINET_ADMIN_TAB_QUERY,
  CABINET_ADMIN_TAB_TO_QUERY,
  cabinetAdminTabFromQuery,
  type CabinetAdminTab,
} from "~/constants/cabinetAdminTabs";
import {
  CabinetAdminBusyKey,
  CabinetAdminPendingEditBrandIdKey,
  CabinetAdminPendingEditCategoryIdKey,
  CabinetAdminPendingEditMotorcycleListingIdKey,
  CabinetAdminPendingEditProductIdKey,
} from "~/constants/cabinetInjection";
import { IconEdit, IconTrash } from "~/components/icons";
import AdminCatalogMotorcycleTab from "./AdminCatalogMotorcycleTab.vue";
import AdminCatalogNewProductTab from "./AdminCatalogNewProductTab.vue";
import AdminCatalogRefsTab from "./AdminCatalogRefsTab.vue";

const route = useRoute();
const router = useRouter();

const {
  contextLoading,
  contextError,
  loadContext,
  categories,
  brands,
  products,
  motorcycleListings,
  submitDeleteCategory,
  submitDeleteBrand,
  submitDeleteMotorcycleListing,
} = useAdminCatalog();

const imagePreviewSrc = useCabinetPublicFileUrl();

const adminBusy = ref(false);
provide(CabinetAdminBusyKey, adminBusy);

const pendingEditProductId = ref<number | null>(null);
provide(CabinetAdminPendingEditProductIdKey, pendingEditProductId);

const pendingEditCategoryId = ref<number | null>(null);
provide(CabinetAdminPendingEditCategoryIdKey, pendingEditCategoryId);

const pendingEditBrandId = ref<number | null>(null);
provide(CabinetAdminPendingEditBrandIdKey, pendingEditBrandId);

const pendingEditMotorcycleListingId = ref<number | null>(null);
provide(
  CabinetAdminPendingEditMotorcycleListingIdKey,
  pendingEditMotorcycleListingId,
);

const categoriesSorted = computed(() =>
  [...categories.value].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  ),
);

const brandsSorted = computed(() =>
  [...brands.value].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  ),
);

const productsSorted = computed(() =>
  [...products.value].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  ),
);

const motorcycleListingsSorted = computed(() =>
  [...motorcycleListings.value].sort((a, b) => b.id - a.id),
);

const categoryNameById = computed(() => {
  const m = new Map<number, string>();
  for (const c of categories.value) m.set(c.id, c.name);
  return m;
});

function parentCategoryLabel(parentId: number | null): string {
  if (parentId == null) return "—";
  return categoryNameById.value.get(parentId) ?? `#${parentId}`;
}

function openProductEditor(id: number) {
  pendingEditProductId.value = id;
  setTab("newProduct");
}

function openCategoryEditor(id: number) {
  pendingEditCategoryId.value = id;
}

function openBrandEditor(id: number) {
  pendingEditBrandId.value = id;
}

async function confirmDeleteCategory(c: AdminCategory) {
  if (disabled.value) return;
  const ok = window.confirm(
    `Удалить категорию «${c.name}»? Действие необратимо.`,
  );
  if (!ok) return;
  adminBusy.value = true;
  try {
    await submitDeleteCategory(c.id);
  } finally {
    adminBusy.value = false;
  }
}

async function confirmDeleteBrand(b: AdminBrand) {
  if (disabled.value) return;
  const ok = window.confirm(`Удалить бренд «${b.name}»? Действие необратимо.`);
  if (!ok) return;
  adminBusy.value = true;
  try {
    await submitDeleteBrand(b.id);
  } finally {
    adminBusy.value = false;
  }
}

function openMotorcycleEditor(id: number) {
  pendingEditMotorcycleListingId.value = id;
  setTab("motorcycle");
}

async function confirmDeleteMotorcycle(m: AdminMotorcycleListing) {
  if (disabled.value) return;
  const ok = window.confirm(
    `Удалить объявление #${m.id} (${m.brand.name} ${m.model})? Действие необратимо.`,
  );
  if (!ok) return;
  adminBusy.value = true;
  try {
    await submitDeleteMotorcycleListing(m.id);
  } finally {
    adminBusy.value = false;
  }
}

function mainProductThumb(p: AdminProduct) {
  const main = p.images?.find((im) => im.isMain) ?? p.images?.[0];
  return main ? imagePreviewSrc(main.url) : "";
}

function mainMotorcycleThumb(m: AdminMotorcycleListing) {
  const main = m.images?.find((im) => im.isMain) ?? m.images?.[0];
  return main ? imagePreviewSrc(main.url) : "";
}

const DEFAULT_TAB: CabinetAdminTab = "refs";

function tabFromRoute(): CabinetAdminTab {
  return (
    cabinetAdminTabFromQuery(route.query[CABINET_ADMIN_TAB_QUERY]) ??
    DEFAULT_TAB
  );
}

const adminTab = ref<CabinetAdminTab>(tabFromRoute());

function syncQueryToTab(tab: CabinetAdminTab) {
  const q = { ...route.query };
  const cur = q[CABINET_ADMIN_TAB_QUERY];
  const wantSlug = tab === DEFAULT_TAB ? null : CABINET_ADMIN_TAB_TO_QUERY[tab];

  if (wantSlug === null) {
    if (cur === undefined) return;
    delete q[CABINET_ADMIN_TAB_QUERY];
  } else {
    if (cur === wantSlug) return;
    q[CABINET_ADMIN_TAB_QUERY] = wantSlug;
  }
  void router.replace({ query: q });
}

watch(adminTab, (tab) => {
  syncQueryToTab(tab);
});

watch(
  () => route.query[CABINET_ADMIN_TAB_QUERY],
  () => {
    const raw = route.query[CABINET_ADMIN_TAB_QUERY];
    const hasTabParam = Array.isArray(raw)
      ? raw.some((x) => typeof x === "string" && x.length > 0)
      : typeof raw === "string" && raw.length > 0;
    const invalid = hasTabParam && cabinetAdminTabFromQuery(raw) === null;

    if (invalid) {
      const q = { ...route.query };
      delete q[CABINET_ADMIN_TAB_QUERY];
      void router.replace({ query: q });
      if (adminTab.value !== DEFAULT_TAB) adminTab.value = DEFAULT_TAB;
      return;
    }

    const next = tabFromRoute();
    if (adminTab.value !== next) adminTab.value = next;
  },
  { immediate: true },
);

onMounted(() => {
  void loadContext();
});

const disabled = computed(() => adminBusy.value || contextLoading.value);

function setTab(tab: CabinetAdminTab) {
  adminTab.value = tab;
}
</script>

<template>
  <div class="admin-blocks">
    <p v-if="contextLoading" class="admin-blocks__state">Загрузка…</p>
    <p v-else-if="contextError" class="admin-blocks__state form__error">
      {{ contextError }}
      <vl-button type="button" @click="loadContext"> Повторить </vl-button>
    </p>

    <template v-else>
      <aside class="admin-tabs" role="tablist" aria-label="Разделы кабинета">
        <button
          type="button"
          class="admin-tabs__tab"
          role="tab"
          :aria-selected="adminTab === 'refs'"
          @click="setTab('refs')"
        >
          Создать категорию
        </button>
        <button
          type="button"
          class="admin-tabs__tab"
          role="tab"
          :aria-selected="adminTab === 'newProduct'"
          @click="setTab('newProduct')"
        >
          Создать товар
        </button>
        <button
          type="button"
          class="admin-tabs__tab"
          role="tab"
          :aria-selected="adminTab === 'motorcycle'"
          @click="setTab('motorcycle')"
        >
          Мотоцикл (объявление)
        </button>
      </aside>

      <div class="admin-blocks__content">
        <aside class="admin-blocks__sidebar">
          <div v-show="adminTab === 'refs'">
            <AdminCatalogRefsTab :disabled="disabled" />
          </div>
          <div v-show="adminTab === 'newProduct'">
            <AdminCatalogNewProductTab :disabled="disabled" />
          </div>
          <div v-show="adminTab === 'motorcycle'">
            <AdminCatalogMotorcycleTab :disabled="disabled" />
          </div>
        </aside>

        <div class="admin-blocks__main">
          <div class="admin-main-panel">
            <template v-if="adminTab === 'refs'">
              <section class="admin-main-panel__section">
                <h2 class="admin-main-panel__title">Категории</h2>
                <p
                  v-if="!categoriesSorted.length"
                  class="admin-main-panel__empty"
                >
                  Пока нет категорий. Создайте первую слева.
                </p>
                <ul v-else class="admin-main-list" role="list">
                  <li
                    v-for="c in categoriesSorted"
                    :key="c.id"
                    class="admin-main-list__row"
                  >
                    <div class="admin-main-list__body">
                      <span class="admin-main-list__primary">{{ c.name }}</span>
                      <span class="admin-main-list__meta"
                        >{{ c.slug }} · родитель:
                        {{ parentCategoryLabel(c.parentId) }}</span
                      >
                    </div>
                    <div class="admin-main-list__actions">
                      <vl-button
                        type="button"
                        class="admin-main-list__icon-btn"
                        :disabled="disabled"
                        aria-label="Редактировать"
                        title="Редактировать категорию (форма слева)"
                        @click="openCategoryEditor(c.id)"
                      >
                        <IconEdit />
                      </vl-button>
                      <vl-button
                        type="button"
                        class="admin-main-list__icon-btn"
                        :disabled="disabled"
                        aria-label="Удалить"
                        title="Удалить категорию"
                        @click="confirmDeleteCategory(c)"
                      >
                        <IconTrash />
                      </vl-button>
                    </div>
                  </li>
                </ul>
              </section>
              <section class="admin-main-panel__section">
                <h2 class="admin-main-panel__title">Бренды</h2>
                <p v-if="!brandsSorted.length" class="admin-main-panel__empty">
                  Пока нет брендов. Создайте первый слева.
                </p>
                <ul v-else class="admin-main-list" role="list">
                  <li
                    v-for="b in brandsSorted"
                    :key="b.id"
                    class="admin-main-list__row"
                  >
                    <div class="admin-main-list__body">
                      <span class="admin-main-list__primary">{{ b.name }}</span>
                      <span class="admin-main-list__meta">{{ b.slug }}</span>
                    </div>
                    <div class="admin-main-list__actions">
                      <vl-button
                        type="button"
                        class="admin-main-list__icon-btn"
                        :disabled="disabled"
                        aria-label="Редактировать"
                        title="Редактировать бренд (форма слева)"
                        @click="openBrandEditor(b.id)"
                      >
                        <IconEdit />
                      </vl-button>
                      <vl-button
                        type="button"
                        class="admin-main-list__icon-btn"
                        :disabled="disabled"
                        aria-label="Удалить"
                        title="Удалить бренд"
                        @click="confirmDeleteBrand(b)"
                      >
                        <IconTrash />
                      </vl-button>
                    </div>
                  </li>
                </ul>
              </section>
            </template>

            <template v-else-if="adminTab === 'newProduct'">
              <section class="admin-main-panel__section">
                <h2 class="admin-main-panel__title">Товары в каталоге</h2>
                <p
                  v-if="!productsSorted.length"
                  class="admin-main-panel__empty"
                >
                  Пока нет товаров. После создания слева они появятся здесь.
                </p>
                <ul v-else class="admin-main-list" role="list">
                  <li
                    v-for="p in productsSorted"
                    :key="p.id"
                    class="admin-main-list__row"
                  >
                    <img
                      v-if="mainProductThumb(p)"
                      class="admin-main-list__thumb"
                      :src="mainProductThumb(p)"
                      alt=""
                      width="48"
                      height="48"
                      loading="lazy"
                    />
                    <div class="admin-main-list__body">
                      <span class="admin-main-list__primary">{{
                        p.title
                      }}</span>
                      <span class="admin-main-list__meta"
                        >#{{ p.id }} · {{ p.slug }} · {{ p.price }}
                        {{ p.currency }}</span
                      >
                    </div>
                    <div class="admin-main-list__actions">
                      <vl-button
                        type="button"
                        class="admin-main-list__icon-btn"
                        :disabled="disabled"
                        aria-label="Редактировать"
                        title="Редактировать товар"
                        @click="openProductEditor(p.id)"
                      >
                        <IconEdit />
                      </vl-button>
                      <vl-button
                        type="button"
                        class="admin-main-list__icon-btn"
                        disabled
                        aria-label="Удалить"
                        :title="'Удаление товаров в API кабинета пока не подключено'"
                      >
                        <IconTrash />
                      </vl-button>
                    </div>
                  </li>
                </ul>
              </section>
            </template>

            <template v-else-if="adminTab === 'motorcycle'">
              <section class="admin-main-panel__section">
                <h2 class="admin-main-panel__title">Текущие объявления</h2>
                <p
                  v-if="!motorcycleListingsSorted.length"
                  class="admin-main-panel__empty"
                >
                  Объявлений пока нет.
                </p>
                <ul v-else class="admin-main-list" role="list">
                  <li
                    v-for="m in motorcycleListingsSorted"
                    :key="m.id"
                    class="admin-main-list__row"
                  >
                    <img
                      v-if="mainMotorcycleThumb(m)"
                      class="admin-main-list__thumb"
                      :src="mainMotorcycleThumb(m)"
                      alt=""
                      width="48"
                      height="48"
                      loading="lazy"
                    />
                    <div class="admin-main-list__body">
                      <span class="admin-main-list__primary"
                        >{{ m.brand.name }} {{ m.model }}</span
                      >
                      <span class="admin-main-list__meta"
                        >#{{ m.id }} · {{ m.year }} г. · {{ m.price }}
                        {{ m.currency }} · VIN: {{ m.vin }}</span
                      >
                    </div>
                    <div class="admin-main-list__actions">
                      <vl-button
                        type="button"
                        class="admin-main-list__icon-btn"
                        :disabled="disabled"
                        aria-label="Редактировать"
                        title="Редактировать объявление (форма слева)"
                        @click="openMotorcycleEditor(m.id)"
                      >
                        <IconEdit />
                      </vl-button>
                      <vl-button
                        type="button"
                        class="admin-main-list__icon-btn"
                        :disabled="disabled"
                        aria-label="Удалить"
                        title="Удалить объявление"
                        @click="confirmDeleteMotorcycle(m)"
                      >
                        <IconTrash />
                      </vl-button>
                    </div>
                  </li>
                </ul>
              </section>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

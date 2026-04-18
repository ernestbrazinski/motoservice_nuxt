<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from "vue";
import { useAdminCatalog } from "~/composables/useAdminCatalog";
import {
  CABINET_ADMIN_TAB_QUERY,
  CABINET_ADMIN_TAB_TO_QUERY,
  cabinetAdminTabFromQuery,
  type CabinetAdminTab,
} from "~/constants/cabinetAdminTabs";
import { CabinetAdminBusyKey } from "~/constants/cabinetInjection";
import AdminCatalogEditProductTab from "./AdminCatalogEditProductTab.vue";
import AdminCatalogMotorcycleTab from "./AdminCatalogMotorcycleTab.vue";
import AdminCatalogNewProductTab from "./AdminCatalogNewProductTab.vue";
import AdminCatalogRefsTab from "./AdminCatalogRefsTab.vue";

const route = useRoute();
const router = useRouter();

const { contextLoading, contextError, loadContext } = useAdminCatalog();

const adminBusy = ref(false);
provide(CabinetAdminBusyKey, adminBusy);

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
  const wantSlug =
    tab === DEFAULT_TAB ? null : CABINET_ADMIN_TAB_TO_QUERY[tab];

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
    const hasTabParam =
      Array.isArray(raw)
        ? raw.some((x) => typeof x === "string" && x.length > 0)
        : typeof raw === "string" && raw.length > 0;
    const invalid =
      hasTabParam && cabinetAdminTabFromQuery(raw) === null;

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
      <div class="admin-tabs" role="tablist" aria-label="Разделы кабинета">
        <button
          type="button"
          class="admin-tabs__tab"
          role="tab"
          :aria-selected="adminTab === 'refs'"
          @click="setTab('refs')"
        >
          Категории
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
          :aria-selected="adminTab === 'editProduct'"
          @click="setTab('editProduct')"
        >
          Редактирование товара
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
      </div>

      <div v-show="adminTab === 'refs'">
        <AdminCatalogRefsTab :disabled="disabled" />
      </div>
      <div v-show="adminTab === 'newProduct'">
        <AdminCatalogNewProductTab :disabled="disabled" />
      </div>
      <div v-show="adminTab === 'editProduct'">
        <AdminCatalogEditProductTab :disabled="disabled" />
      </div>
      <div v-show="adminTab === 'motorcycle'">
        <AdminCatalogMotorcycleTab :disabled="disabled" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { headerNavItems } from "~/utils/headerNav";
import { setTheme, theme } from "~/utils/theme";
import { isSuperadminRole } from "~/utils/userRole";

// Icons
import { IconLogout } from "~/components/icons";

const { t } = useI18n();
const { authed, user, logout } = useAuthSession();

const showAdminLogout = computed(() => {
  if (!authed.value || !user.value?.role) return false;
  return isSuperadminRole(user.value.role);
});
const navRoot = ref<HTMLElement | null>(null);
const openMenuId = ref<string | null>(null);

function toggleMenu(id: string) {
  openMenuId.value = openMenuId.value === id ? null : id;
}

function closeMenus() {
  openMenuId.value = null;
}

function onDocPointerDown(e: MouseEvent) {
  const root = navRoot.value;
  if (!root || openMenuId.value === null) return;
  if (!root.contains(e.target as Node)) closeMenus();
}

function onEscape(e: KeyboardEvent) {
  if (e.key === "Escape") closeMenus();
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocPointerDown, true);
  document.addEventListener("keydown", onEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocPointerDown, true);
  document.removeEventListener("keydown", onEscape);
});

function onThemeChange(e: Event) {
  const checked = (e as CustomEvent<{ checked: boolean }>).detail?.checked;
  if (typeof checked !== "boolean") return;
  setTheme(checked ? "light" : "dark");
}
</script>

<template>
  <header class="header">
    <div class="container">
      <div class="header__logo">
        <NuxtLink to="/"> MotoService </NuxtLink>
      </div>
      <nav ref="navRoot" class="header__nav" :aria-label="t('nav.mainMenu')">
        <template
          v-for="item in headerNavItems"
          :key="item.kind === 'link' ? item.to + item.labelKey : item.id"
        >
          <NuxtLink
            v-if="item.kind === 'link'"
            :to="item.to"
            class="header__link"
            >{{ t(item.labelKey) }}</NuxtLink
          >
          <div v-else class="header__nav-item">
            <button
              type="button"
              class="header__nav-trigger"
              :aria-expanded="openMenuId === item.id"
              aria-haspopup="true"
              @click.stop="toggleMenu(item.id)"
            >
              {{ t(item.labelKey) }}
              <span class="header__nav-chevron" aria-hidden="true" />
            </button>
            <ul
              v-show="openMenuId === item.id"
              class="header__submenu"
              role="menu"
            >
              <li
                v-for="child in item.children"
                :key="child.labelKey"
                role="none"
              >
                <NuxtLink
                  role="menuitem"
                  :to="child.to"
                  class="header__submenu-link"
                  @click="closeMenus"
                  >{{ t(child.labelKey) }}</NuxtLink
                >
              </li>
            </ul>
          </div>
        </template>
      </nav>
      <div class="header__tools">
        <label class="header__field">
          <UiSelectLanguage />
        </label>
        <div class="header__theme" role="group" :aria-label="t('theme.toggle')">
          <vl-toggle-switch
            :checked="theme === 'light'"
            @vl-change="onThemeChange"
          />
        </div>
        <vl-button
          v-if="showAdminLogout"
          type="button"
          class="header__logout"
          :aria-label="t('admin.logout')"
          @click="logout"
        >
          <IconLogout />
        </vl-button>
      </div>
    </div>
  </header>
</template>

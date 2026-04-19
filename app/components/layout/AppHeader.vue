<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { headerNavItems } from "~/utils/headerNav";
import { setTheme, theme } from "~/utils/theme";
import { isSuperadminRole } from "~/utils/userRole";

// Icons
import { IconChevronDown, IconLogout, IconMenu } from "~/components/icons";

/** Matches `app/assets/styles/vars.scss` `$breakpoint-md` for `matchMedia`. */
const HEADER_MD_MAX_PX = 1024;

const { t } = useI18n();
const route = useRoute();
const { authed, user, logout } = useAuthSession();
const { setHeaderSubmenuOpen } = useHeaderSubmenuOpen();

const isCabinetPage = computed(
  () => route.path === "/cabinet" || route.path.startsWith("/cabinet/"),
);

const showAdminLogout = computed(() => {
  if (!authed.value || !user.value?.role) return false;
  return isSuperadminRole(user.value.role);
});
const navRoot = ref<HTMLElement | null>(null);
const headerEl = ref<HTMLElement | null>(null);
const openMenuId = ref<string | null>(null);
const mobileNavOpen = ref(false);

let headerResizeObserver: ResizeObserver | null = null;
let mobileNavMediaQuery: MediaQueryList | null = null;

function closeMobileNav() {
  mobileNavOpen.value = false;
}

function toggleMobileNav() {
  mobileNavOpen.value = !mobileNavOpen.value;
}

function onMobileNavMediaChange() {
  if (mobileNavMediaQuery && !mobileNavMediaQuery.matches) {
    mobileNavOpen.value = false;
  }
}

function afterNavLinkActivate() {
  closeMenus();
  closeMobileNav();
}

/** Syncs `--header-height` on `<html>` from the fixed header box (wraps on narrow viewports). */
function syncHeaderHeightCssVar() {
  const el = headerEl.value;
  if (!el || typeof document === "undefined") return;
  const h = Math.round(el.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--header-height", `${h}px`);
}

watch([openMenuId, mobileNavOpen], () => {
  setHeaderSubmenuOpen(
    openMenuId.value !== null || mobileNavOpen.value === true,
  );
});

watch(mobileNavOpen, async (open) => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = open ? "hidden" : "";
  await nextTick();
  syncHeaderHeightCssVar();
});

watch(
  () => route.path,
  () => {
    closeMenus();
    closeMobileNav();
  },
);

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
  if (e.key !== "Escape") return;
  if (mobileNavOpen.value) {
    closeMobileNav();
    return;
  }
  closeMenus();
}

onMounted(async () => {
  document.addEventListener("pointerdown", onDocPointerDown, true);
  document.addEventListener("keydown", onEscape);

  if (typeof window !== "undefined" && typeof window.matchMedia !== "undefined") {
    mobileNavMediaQuery = window.matchMedia(
      `(max-width: ${HEADER_MD_MAX_PX}px)`,
    );
    mobileNavMediaQuery.addEventListener("change", onMobileNavMediaChange);
  }

  await nextTick();
  syncHeaderHeightCssVar();
  if (typeof ResizeObserver !== "undefined" && headerEl.value) {
    headerResizeObserver = new ResizeObserver(() => syncHeaderHeightCssVar());
    headerResizeObserver.observe(headerEl.value);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocPointerDown, true);
  document.removeEventListener("keydown", onEscape);
  mobileNavMediaQuery?.removeEventListener("change", onMobileNavMediaChange);
  mobileNavMediaQuery = null;
  document.body.style.overflow = "";
  headerResizeObserver?.disconnect();
  headerResizeObserver = null;
  document.documentElement.style.removeProperty("--header-height");
});

function onThemeChange(e: Event) {
  const checked = (e as CustomEvent<{ checked: boolean }>).detail?.checked;
  if (typeof checked !== "boolean") return;
  setTheme(checked ? "light" : "dark");
}
</script>

<template>
  <header ref="headerEl" class="header" :class="{ cabinet: isCabinetPage }">
    <div
      v-show="mobileNavOpen"
      class="header__nav-backdrop"
      aria-hidden="true"
      @click="closeMobileNav"
    />
    <div class="container">
      <div class="header__logo">
        <NuxtLink to="/"> MotoService </NuxtLink>
      </div>
      <nav
        id="header-main-nav"
        ref="navRoot"
        class="header__nav"
        :class="{ 'header__nav--open': mobileNavOpen }"
        :aria-label="t('nav.mainMenu')"
      >
        <div class="header__nav-main">
          <template
            v-for="item in headerNavItems"
            :key="item.kind === 'link' ? item.to + item.labelKey : item.id"
          >
            <NuxtLink
              v-if="item.kind === 'link'"
              :to="item.to"
              class="header__link"
              @click="afterNavLinkActivate"
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
                <IconChevronDown
                  class="header__nav-chevron"
                  :size="16"
                  aria-hidden="true"
                />
              </button>
              <ul
                v-show="openMenuId === item.id"
                class="header__submenu"
                role="menu"
              >
                <li
                  v-for="child in item.children"
                  :key="child.labelKey + (child.imageSrc ?? '')"
                  role="none"
                >
                  <NuxtLink
                    role="menuitem"
                    :to="child.to"
                    class="header__submenu-link"
                    :class="{
                      'header__submenu-link--with-image': child.imageSrc,
                    }"
                    @click="afterNavLinkActivate"
                  >
                    <img
                      v-if="child.imageSrc"
                      class="header__submenu-thumb"
                      :src="child.imageSrc"
                      :alt="''"
                      loading="lazy"
                      decoding="async"
                    />
                    <span class="header__submenu-label">{{
                      t(child.labelKey)
                    }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </template>
        </div>
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
            class="icon-button"
            :aria-label="t('admin.logout')"
            @click="logout"
          >
            <IconLogout />
          </vl-button>
        </div>
      </nav>
      <button
        type="button"
        class="header__menu-toggle"
        :aria-expanded="mobileNavOpen"
        aria-controls="header-main-nav"
        :aria-label="
          mobileNavOpen ? t('nav.closeMobileMenu') : t('nav.openMobileMenu')
        "
        @click="toggleMobileNav"
      >
        <IconMenu :size="22" />
      </button>
    </div>
  </header>
</template>

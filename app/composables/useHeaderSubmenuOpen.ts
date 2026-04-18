import { readonly, ref } from "vue";

/** True while a header nav dropdown (submenu) is expanded. */
const headerSubmenuOpen = ref(false);

export function useHeaderSubmenuOpen() {
  function setHeaderSubmenuOpen(open: boolean) {
    headerSubmenuOpen.value = open;
  }

  return {
    headerSubmenuOpen: readonly(headerSubmenuOpen),
    setHeaderSubmenuOpen,
  };
}

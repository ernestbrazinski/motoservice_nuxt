/** On reload: if a JWT exists, run `me` and refresh client auth state. */
export default defineNuxtPlugin({
  name: "auth-hydrate",
  enforce: "pre",
  async setup() {
    if (!import.meta.client) return;
    const auth = useAuthSession();
    await auth.hydrateFromToken();
  },
});

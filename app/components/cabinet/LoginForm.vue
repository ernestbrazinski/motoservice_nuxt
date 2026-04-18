<script setup lang="ts">
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import { mapCabinetLoginError } from "~/utils/mapCabinetLoginError";

const { t } = useI18n();
const { login } = useAuthSession();

const loginForm = reactive({
  email: "admin@example.com",
  password: "change-me",
  error: false,
  errorMessage: "",
  loading: false,
});

function onEmailInput(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) loginForm.email = v;
}

function onPasswordInput(e: Event) {
  const v = (e as CustomEvent<{ value: string }>).detail?.value;
  if (v !== undefined) loginForm.password = v;
}

async function tryLogin() {
  loginForm.error = false;
  loginForm.errorMessage = "";
  loginForm.loading = true;
  try {
    await login(loginForm.email, loginForm.password);
  } catch (e) {
    loginForm.error = true;
    const code = e instanceof Error ? e.message : "";
    loginForm.errorMessage = mapCabinetLoginError(code, t("admin.loginError"));
  } finally {
    loginForm.loading = false;
  }
}
</script>

<template>
  <div>
    <p v-if="loginForm.error" class="form__error">
      {{ loginForm.errorMessage || t("admin.loginError") }}
    </p>
    <form
      class="form-auth d-flex d-flex-column gap-16"
      @submit.prevent="tryLogin"
    >
      <vl-input
        type="email"
        wide
        autocomplete="username"
        :value="loginForm.email"
        placeholder="Логин"
        float
        @vl-input="onEmailInput"
      />
      <vl-input
        type="password"
        wide
        autocomplete="current-password"
        :value="loginForm.password"
        :placeholder="t('admin.passwordLabel')"
        float
        @vl-input="onPasswordInput"
      />
      <vl-button type="submit" :disabled="loginForm.loading">
        {{ t("admin.loginSubmit") }}
      </vl-button>
    </form>
  </div>
</template>

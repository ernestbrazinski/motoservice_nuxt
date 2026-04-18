import { nextTick } from "vue";
import type { VlNotificationVariant } from "velair-ui";
import { VlNotification } from "velair-ui";

if (import.meta.client) {
  void VlNotification;
}

export type CabinetToastKind = "success" | "error" | "info";

function kindToVariant(kind: CabinetToastKind): VlNotificationVariant {
  if (kind === "error") return "error";
  if (kind === "info") return "warning";
  return "success";
}

export function useCabinetToast() {
  const notifOpen = useState("cabinet-notif-open", () => false);
  const notifVariant = useState<VlNotificationVariant>(
    "cabinet-notif-variant",
    () => "success",
  );
  const notifText = useState("cabinet-notif-text", () => "");
  const notifDelay = useState("cabinet-notif-delay", () => 5000);

  async function show(kind: CabinetToastKind, text: string, ttlMs = 5000) {
    notifOpen.value = false;
    await nextTick();
    notifVariant.value = kindToVariant(kind);
    notifText.value = text;
    notifDelay.value = ttlMs <= 0 ? 0 : ttlMs;
    notifOpen.value = true;
  }

  function dismiss() {
    notifOpen.value = false;
  }

  return {
    notifOpen,
    notifVariant,
    notifText,
    notifDelay,
    show,
    dismiss,
  };
}

const FLAG_KEY = "prevsante.bienvenueVue";

export function bienvenueVue(): boolean {
  if (typeof window === "undefined") return true; // SSR : pas d'onboarding
  try {
    return window.localStorage.getItem(FLAG_KEY) === "1";
  } catch {
    return true;
  }
}

export function marquerBienvenueVue() {
  try {
    window.localStorage.setItem(FLAG_KEY, "1");
  } catch {
    /* stockage indisponible */
  }
}

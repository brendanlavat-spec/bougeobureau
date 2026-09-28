import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CONSENT_VERSION, emptyData, emptyProfile, type BreakEntry, type Consent, type HealthData, type Profile } from "./health-types";

const STORAGE_KEY = "prevsante.v2";

function readStorage(): HealthData {
  try {
    window.localStorage.removeItem("prevsante.v1"); // ancienne version avec données de santé : purgée
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as Partial<HealthData>;
    return {
      consent: parsed.consent?.version === CONSENT_VERSION ? parsed.consent : null,
      profile: { ...emptyProfile, ...(parsed.profile ?? {}) },
      breaks: parsed.breaks ?? [],
      steps: parsed.steps ?? {},
    };
  } catch {
    return emptyData;
  }
}

interface Store {
  data: HealthData;
  hydrated: boolean;
  lastActiveAt: number;
  setConsent: (consent: Consent | null) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  logBreak: (exerciceId?: string | null) => void;
  addSteps: (n: number, at?: number) => void;
  eraseAll: () => void;
  exportJson: () => string;
}

const HealthContext = createContext<Store | null>(null);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HealthData>(emptyData);
  const [hydrated, setHydrated] = useState(false);
  const [lastActiveAt, setLastActiveAt] = useState(() => Date.now());

  useEffect(() => {
    const d = readStorage();
    setData(d);
    setLastActiveAt(Date.now());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* quota indisponible */
    }
  }, [data, hydrated]);

  const setConsent = useCallback((consent: Consent | null) => setData((d) => ({ ...d, consent })), []);
  const updateProfile = useCallback(
    (patch: Partial<Profile>) => setData((d) => ({ ...d, profile: { ...d.profile, ...patch } })),
    [],
  );
  const logBreak = useCallback((exerciceId: string | null = null) => {
    const entry: BreakEntry = { id: crypto.randomUUID(), at: new Date().toISOString(), exerciceId };
    setData((d) => ({ ...d, breaks: [entry, ...d.breaks].slice(0, 2000) }));
    setLastActiveAt(Date.now());
  }, []);
  const addSteps = useCallback((n: number, at?: number) => {
    if (n <= 0) return;
    const key = todayIso(at ? new Date(at) : new Date());
    setData((d) => ({ ...d, steps: { ...d.steps, [key]: (d.steps[key] ?? 0) + n } }));
    // marcher compte comme une activité : le minuteur repart (seulement pour les pas récents)
    if (!at || Date.now() - at < 10 * 60_000) setLastActiveAt(Date.now());
  }, []);
  const eraseAll = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem("bouge.pedometer.lastSync");
    } catch {
      /* ignore */
    }
    setData(emptyData);
  }, []);
  const exportJson = useCallback(() => JSON.stringify(data, null, 2), [data]);

  const value = useMemo(
    () => ({ data, hydrated, lastActiveAt, setConsent, updateProfile, logBreak, addSteps, eraseAll, exportJson }),
    [data, hydrated, lastActiveAt, setConsent, updateProfile, logBreak, addSteps, eraseAll, exportJson],
  );

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealth doit être utilisé dans HealthProvider");
  return ctx;
}

export function todayIso(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function localDay(iso: string) {
  return todayIso(new Date(iso));
}

export function generatePatientCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "23456789";
  const pick = (src: string, n: number) =>
    Array.from({ length: n }, () => src[Math.floor(Math.random() * src.length)]).join("");
  return `${pick(letters, 3)}-${pick(digits, 4)}`;
}

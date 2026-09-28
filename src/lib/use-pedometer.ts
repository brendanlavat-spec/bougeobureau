import { useCallback, useEffect, useRef, useState } from "react";

interface MotionPermissionCtor {
  requestPermission?: () => Promise<"granted" | "denied">;
}

export type PedometerStatus =
  | "off" // désactivé
  | "active" // mesure en cours, app au premier plan
  | "background" // app en arrière-plan, le système continue de compter
  | "suspended" // la mesure est arrêtée par le système
  | "denied" // permission refusée
  | "unsupported";

export type Platform = "web" | "ios" | "android";

export interface PedometerGap {
  from: number;
  to: number;
}

const SYNC_KEY = "bouge.pedometer.lastSync";

function readLastSync(): number | null {
  const v = Number(localStorage.getItem(SYNC_KEY));
  return Number.isFinite(v) && v > 0 ? v : null;
}
function writeLastSync(t: number) {
  localStorage.setItem(SYNC_KEY, String(t));
}

/** Découpe [from, to] aux minuits locaux, pour attribuer les pas au bon jour. */
function splitByDay(from: number, to: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let s = from;
  while (s < to) {
    const d = new Date(s);
    d.setHours(24, 0, 0, 0);
    const e = Math.min(d.getTime(), to);
    out.push([s, e]);
    s = e;
  }
  return out;
}

/**
 * Podomètre.
 * - Web : accéléromètre (DeviceMotion), uniquement app ouverte → suspendu en arrière-plan.
 * - iOS installable : coprocesseur de mouvement (CMPedometer). Le système compte en
 *   continu ; au retour, les pas faits en arrière-plan sont récupérés (jusqu'à 7 jours).
 * - Android installable : capteur de pas matériel. Les pas en arrière-plan sont
 *   rattrapés au retour tant que le système n'a pas fermé l'application ; sinon la
 *   période est signalée comme non mesurée.
 * Aucune donnée ne quitte l'appareil.
 */
export function usePedometer(
  active: boolean,
  onSteps: (n: number, at?: number) => void,
) {
  const [platform, setPlatform] = useState<Platform>("web");
  const [status, setStatus] = useState<PedometerStatus>("off");
  const [needsPermission, setNeedsPermission] = useState(false);
  const [suspendedSince, setSuspendedSince] = useState<number | null>(null);
  const [lastGap, setLastGap] = useState<PedometerGap | null>(null);
  const [recovered, setRecovered] = useState<{ steps: number; at: number } | null>(null);
  const pending = useRef(0);
  const onStepsRef = useRef(onSteps);
  onStepsRef.current = onSteps;
  const cleanupRef = useRef<(() => void) | null>(null);
  const running = status === "active" || status === "background" || status === "suspended";

  // Détection de la plateforme (après hydratation)
  useEffect(() => {
    let alive = true;
    import("@capacitor/core").then(({ Capacitor }) => {
      if (!alive) return;
      const p = Capacitor.getPlatform();
      setPlatform(p === "ios" || p === "android" ? p : "web");
    });
    return () => {
      alive = false;
    };
  }, []);

  // Envoi groupé des pas web toutes les 5 s
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      if (pending.current > 0) {
        onStepsRef.current(pending.current);
        pending.current = 0;
      }
    }, 5000);
    return () => clearInterval(t);
  }, [running]);

  const stop = useCallback(() => {
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  /* ---------------- Web ---------------- */
  const startWeb = useCallback(() => {
    if (!("DeviceMotionEvent" in window)) {
      setStatus("unsupported");
      return false;
    }
    let lastMag = 0;
    let lastStepAt = 0;
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity ?? e.acceleration;
      if (!a) return;
      const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      const now = Date.now();
      if (lastMag > 0 && mag - lastMag > 1.2 && now - lastStepAt > 350) {
        lastStepAt = now;
        pending.current += 1;
      }
      lastMag = mag;
    };
    let hiddenAt: number | null = null;
    const onVis = () => {
      if (document.hidden) {
        hiddenAt = Date.now();
        setSuspendedSince(hiddenAt);
        setStatus("suspended");
      } else {
        if (hiddenAt && Date.now() - hiddenAt > 30_000) setLastGap({ from: hiddenAt, to: Date.now() });
        hiddenAt = null;
        setSuspendedSince(null);
        setStatus("active");
      }
    };
    window.addEventListener("devicemotion", handler);
    document.addEventListener("visibilitychange", onVis);
    cleanupRef.current = () => {
      window.removeEventListener("devicemotion", handler);
      document.removeEventListener("visibilitychange", onVis);
    };
    setStatus("active");
    return true;
  }, []);

  /* ---------------- Natif (iOS / Android) ---------------- */
  const startNative = useCallback(async (plat: "ios" | "android", askPermission: boolean) => {
    const { CapacitorPedometer } = await import("@capgo/capacitor-pedometer");
    const { App } = await import("@capacitor/app");
    try {
      const avail = await CapacitorPedometer.isAvailable();
      if (!avail.stepCounting) {
        setStatus("unsupported");
        return false;
      }
      let perm = await CapacitorPedometer.checkPermissions();
      if (perm.activityRecognition !== "granted") {
        if (!askPermission) {
          setNeedsPermission(true);
          return false;
        }
        perm = await CapacitorPedometer.requestPermissions();
        if (perm.activityRecognition !== "granted") {
          setStatus("denied");
          return false;
        }
      }
    } catch {
      setStatus("unsupported");
      return false;
    }
    setNeedsPermission(false);

    // iOS : rattrapage des pas comptés par le système depuis la dernière synchro
    const catchUpIos = async () => {
      const last = readLastSync();
      const now = Date.now();
      if (last && now - last > 5_000) {
        const from = Math.max(last, now - 7 * 86_400_000);
        let total = 0;
        for (const [s, e] of splitByDay(from, now)) {
          try {
            const m = await CapacitorPedometer.getMeasurement({ start: s, end: e });
            const n = Math.max(0, Math.round(m.numberOfSteps ?? 0));
            if (n > 0) {
              onStepsRef.current(n, e - 1);
              total += n;
            }
          } catch {
            /* ignore */
          }
        }
        if (total > 0) setRecovered({ steps: total, at: now });
        if (last < now - 7 * 86_400_000) setLastGap({ from: last, to: from });
      }
      writeLastSync(now);
    };

    // Android : un démarrage à froid signifie que le système a fermé l'app
    if (plat === "android") {
      const last = readLastSync();
      if (last && Date.now() - last > 60_000) setLastGap({ from: last, to: Date.now() });
      writeLastSync(Date.now());
    } else {
      await catchUpIos();
    }

    let baseline: number | null = null;
    let lastCount = 0;
    const listener = await CapacitorPedometer.addListener("measurement", (m) => {
      const c = Math.max(0, Math.round(m.numberOfSteps ?? 0));
      if (plat === "ios") {
        // iOS : valeurs cumulées depuis le démarrage des mises à jour
        if (baseline === null) baseline = 0;
        const delta = c - lastCount;
        if (delta > 0) onStepsRef.current(delta);
        lastCount = c;
      } else {
        if (baseline === null) {
          baseline = c;
          lastCount = c;
          return;
        }
        const delta = c >= lastCount ? c - lastCount : c; // remise à zéro du capteur
        if (delta > 0) onStepsRef.current(delta);
        lastCount = c;
      }
      writeLastSync(Date.now());
    });
    await CapacitorPedometer.startMeasurementUpdates();

    const appListener = await App.addListener("appStateChange", async ({ isActive }) => {
      if (!isActive) {
        writeLastSync(Date.now());
        setStatus("background");
        return;
      }
      setSuspendedSince(null);
      if (plat === "ios") {
        // On arrête/relance les mises à jour pour ne pas compter deux fois
        await CapacitorPedometer.stopMeasurementUpdates().catch(() => {});
        lastCount = 0;
        await catchUpIos();
        await CapacitorPedometer.startMeasurementUpdates().catch(() => {});
      }
      setStatus("active");
    });

    // Si aucun signal du capteur pendant longtemps en arrière-plan Android → suspendu
    const watchdog = setInterval(() => {
      if (plat !== "android") return;
      const last = readLastSync();
      if (document.hidden && last && Date.now() - last > 15 * 60_000) {
        setSuspendedSince(last);
        setStatus("suspended");
      }
    }, 60_000);

    cleanupRef.current = () => {
      clearInterval(watchdog);
      listener.remove();
      appListener.remove();
      CapacitorPedometer.stopMeasurementUpdates().catch(() => {});
    };
    setStatus("active");
    return true;
  }, []);

  const start = useCallback(
    async (askPermission: boolean) => {
      stop();
      if (platform === "web") return startWeb();
      return startNative(platform, askPermission);
    },
    [platform, startNative, startWeb, stop],
  );

  // Démarrage / arrêt automatique
  useEffect(() => {
    if (!active) {
      stop();
      setStatus("off");
      return;
    }
    if (running) return;
    if (platform === "web") {
      const ctor = window.DeviceMotionEvent as unknown as MotionPermissionCtor | undefined;
      if (ctor && typeof ctor.requestPermission === "function") {
        setNeedsPermission(true);
        return;
      }
    }
    void start(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, platform]);

  useEffect(() => stop, [stop]);

  const requestAndStart = useCallback(async () => {
    if (platform === "web") {
      const ctor = window.DeviceMotionEvent as unknown as MotionPermissionCtor | undefined;
      if (ctor && typeof ctor.requestPermission === "function") {
        try {
          const r = await ctor.requestPermission();
          if (r !== "granted") {
            setStatus("denied");
            return false;
          }
        } catch {
          return false;
        }
      }
      setNeedsPermission(false);
    }
    return start(true);
  }, [platform, start]);

  return {
    platform,
    status,
    running,
    supported: status !== "unsupported",
    needsPermission,
    suspendedSince,
    lastGap,
    recovered,
    dismissGap: () => setLastGap(null),
    requestAndStart,
  };
}

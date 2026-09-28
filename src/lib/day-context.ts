import type { DayContext, Profile } from "./health-types";

export function defaultContext(p: Profile, date = new Date()): DayContext {
  return p.weekendAtHome && (date.getDay() === 0 || date.getDay() === 6) ? "domicile" : "travail";
}

export function dayContext(p: Profile, date = new Date()): DayContext {
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return p.dayOverrides?.[key] ?? defaultContext(p, date);
}

export function contextHours(p: Profile, context: DayContext) {
  return context === "travail"
    ? { start: p.workStart, end: p.workEnd, interval: p.sedentaryAlertMinutes }
    : { start: p.homeStart, end: p.homeEnd, interval: p.homeAlertMinutes };
}
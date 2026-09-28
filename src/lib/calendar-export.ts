import type { Creneau } from "./planning";
import type { DayContext } from "./health-types";

type CalendarSlot = Creneau & { calendarContext: DayContext };
const recurrence = (c: CalendarSlot) => c.calendarContext === "travail" ? "MO,TU,WE,TH,FR" : "SA,SU";

const pad = (n: number) => String(n).padStart(2, "0");

function debutFin(c: CalendarSlot) {
  const [h, m] = c.heure.split(":").map(Number);
  const d = new Date();
  // Première occurrence du groupe de jours choisi, sans inscrire un événement sur un mauvais jour.
  const days = c.calendarContext === "travail" ? [1, 2, 3, 4, 5] : [0, 6];
  for (let i = 0; i < 7 && !days.includes(d.getDay()); i++) d.setDate(d.getDate() + 1);
  d.setHours(h || 0, m || 0, 0, 0);
  const f = new Date(d.getTime() + c.dureeMin * 60_000);
  const fmt = (x: Date) =>
    `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
  return [fmt(d), fmt(f)] as const;
}

const description = (c: Creneau) =>
  c.type === "seance"
    ? `Séance « ${c.titre} » — ouvrez Bouge au bureau pour le détail.`
    : "Levez-vous 2-3 minutes : marche, étirements, quelques squats.";

/** Lien Google Agenda pré-rempli, répété chaque jour ouvré. */
export function lienGoogle(c: CalendarSlot) {
  const [d, f] = debutFin(c);
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `🏃 ${c.titre}`,
    dates: `${d}/${f}`,
    details: description(c),
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${recurrence(c)}`,
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** Fichier .ics avec tous les créneaux, récurrents du lundi au vendredi, avec rappel. */
export function fichierIcs(items: CalendarSlot[]) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ev = items.map((c) => {
    const [d, f] = debutFin(c);
    return [
      "BEGIN:VEVENT",
       `UID:${c.calendarContext}-${c.id}-${d}@bouge-au-bureau`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${tz}:${d}`,
      `DTEND;TZID=${tz}:${f}`,
       `RRULE:FREQ=WEEKLY;BYDAY=${recurrence(c)}`,
      `SUMMARY:${c.titre}`,
      `DESCRIPTION:${description(c)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT0M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${c.titre}`,
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bouge au bureau//FR", "CALSCALE:GREGORIAN", ...ev, "END:VCALENDAR"].join("\r\n");
}

export function telechargerIcs(items: CalendarSlot[]) {
  const blob = new Blob([fichierIcs(items)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "emploi-du-temps-pauses-actives.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

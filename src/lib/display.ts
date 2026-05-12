export const PROJECT_TYPES = [
  "FILM",
  "LIVE_EVENT",
  "PODCAST",
  "GAME",
  "YOUTUBE",
  "OTHER",
] as const;

export const COMPENSATION_TYPES = ["PAID", "UNPAID", "NEGOTIABLE"] as const;

export const GIG_STATUSES = ["OPEN", "CLOSED"] as const;

export type ProjectTypeValue = (typeof PROJECT_TYPES)[number];
export type CompensationTypeValue = (typeof COMPENSATION_TYPES)[number];
export type GigStatusValue = (typeof GIG_STATUSES)[number];

export function projectTypeLabel(value: string) {
  const labels: Record<string, string> = {
    FILM: "Film",
    LIVE_EVENT: "Live event",
    PODCAST: "Podcast",
    GAME: "Game",
    YOUTUBE: "YouTube",
    OTHER: "Other",
  };
  return labels[value] ?? "Other";
}

export function compensationLabel(value: string) {
  const labels: Record<string, string> = {
    PAID: "Paid",
    UNPAID: "Unpaid + Credit",
    NEGOTIABLE: "Open to talk",
  };
  return labels[value] ?? value;
}

export function gigStatusLabel(value: string) {
  return value === "CLOSED" ? "Filled" : "Open";
}

export function formatDate(value: Date | null | undefined) {
  if (!value) return "Not specified";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function clampText(text: string, max = 160) {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}...`;
}

export function visibleTags(tags: string[], max = 3) {
  return {
    shown: tags.slice(0, max),
    hiddenCount: Math.max(0, tags.length - max),
  };
}


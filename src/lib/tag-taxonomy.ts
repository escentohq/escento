import { normalizeTagName } from "@/lib/form-utils";

export type TagKind = "instrument" | "genre";

type CanonicalTag = {
  label: string;
  aliases: string[];
};

const INSTRUMENTS: CanonicalTag[] = [
  { label: "Drums", aliases: ["drumset", "drum set", "drum kit", "kit", "percussion"] },
  { label: "Guitar", aliases: ["electric guitar", "acoustic guitar", "gtr"] },
  { label: "Bass", aliases: ["bass guitar", "electric bass", "upright bass"] },
  { label: "Piano", aliases: ["keys", "keyboard", "keyboards"] },
  { label: "Vocals", aliases: ["voice", "singer", "singing", "vocalist"] },
  { label: "Saxophone", aliases: ["sax", "alto sax", "tenor sax"] },
  { label: "Trumpet", aliases: ["horn"] },
  { label: "Violin", aliases: ["fiddle"] },
  { label: "Cello", aliases: [] },
  { label: "Flute", aliases: [] },
  { label: "Clarinet", aliases: [] },
  { label: "Producer", aliases: ["beat maker", "beatmaker", "production"] },
];

const GENRES: CanonicalTag[] = [
  { label: "Jazz", aliases: ["swing", "bebop", "big band", "fusion"] },
  { label: "Rock", aliases: ["alt rock", "alternative rock", "indie rock"] },
  { label: "Hip hop", aliases: ["hiphop", "rap", "trap"] },
  { label: "Pop", aliases: ["popular"] },
  { label: "R&B", aliases: ["rnb", "r and b", "rhythm and blues"] },
  { label: "Classical", aliases: ["orchestral", "chamber"] },
  { label: "Film scoring", aliases: ["score", "scoring", "soundtrack", "film score"] },
  { label: "Electronic", aliases: ["edm", "dance", "electronica"] },
  { label: "Folk", aliases: ["singer songwriter", "singer-songwriter"] },
  { label: "Country", aliases: [] },
  { label: "Latin", aliases: ["reggaeton", "salsa", "bachata"] },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function compact(value: string) {
  return normalize(value).replace(/\s+/g, "");
}

export function getCanonicalTags(kind: TagKind) {
  return kind === "instrument" ? INSTRUMENTS : GENRES;
}

export function canonicalizeTag(kind: TagKind, value: string) {
  const normalized = normalize(value);
  const compacted = compact(value);
  const match = getCanonicalTags(kind).find((tag) => {
    const terms = [tag.label, ...tag.aliases];
    return terms.some((term) => normalize(term) === normalized || compact(term) === compacted);
  });

  return match?.label ?? normalizeTagName(value);
}

export function getTagAliasMatch(kind: TagKind, value: string) {
  const normalized = normalize(value);
  const compacted = compact(value);
  const match = getCanonicalTags(kind).find((tag) => (
    tag.aliases.some((alias) => normalize(alias) === normalized || compact(alias) === compacted)
  ));

  return match ? { label: match.label, alias: value } : null;
}

export function tagMatchesQuery(kind: TagKind, storedTag: string, query: string) {
  const canonicalStored = canonicalizeTag(kind, storedTag);
  const canonicalQuery = canonicalizeTag(kind, query);
  const storedTerms = [
    canonicalStored,
    ...(getCanonicalTags(kind).find((tag) => tag.label === canonicalStored)?.aliases ?? []),
  ];

  const normalizedQuery = normalize(query);
  const compactQuery = compact(query);

  return storedTerms.some((term) => (
    canonicalizeTag(kind, term) === canonicalQuery ||
    normalize(term).includes(normalizedQuery) ||
    compact(term).includes(compactQuery) ||
    normalizedQuery.includes(normalize(term)) ||
    compactQuery.includes(compact(term))
  ));
}

export function buildTagOptions(kind: TagKind, existing: Array<{ name: string }>) {
  const options = new Map<string, { value: string; label: string; aliases: string[]; custom: boolean }>();

  for (const tag of getCanonicalTags(kind)) {
    options.set(tag.label, { value: tag.label, label: tag.label, aliases: tag.aliases, custom: false });
  }

  for (const tag of existing) {
    const canonical = canonicalizeTag(kind, tag.name);
    const defaultOption = options.get(canonical);
    if (defaultOption) {
      options.set(canonical, defaultOption);
    } else {
      options.set(tag.name, { value: tag.name, label: tag.name, aliases: [], custom: true });
    }
  }

  return Array.from(options.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export function parseSelectedTags(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

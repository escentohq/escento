"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import {
  buildTagOptions,
  canonicalizeTag,
  getTagAliasMatch,
  type TagKind,
} from "@/lib/tag-taxonomy";

type Option = {
  name: string;
};

type Props = {
  id: string;
  name: string;
  label: string;
  kind: TagKind;
  options: Option[];
  selected: string[];
  placeholder: string;
};

type Suggestion = {
  value: string;
  label: string;
  aliases: string[];
  custom: boolean;
  alias?: string;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function TagFilterMultiSelect({
  id,
  name,
  label,
  kind,
  options,
  selected,
  placeholder,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(() => (
    Array.from(new Set(selected.map((value) => canonicalizeTag(kind, value)).filter(Boolean)))
  ));
  const allOptions = useMemo(() => buildTagOptions(kind, options), [kind, options]);
  const normalizedQuery = normalize(query);

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!normalizedQuery) return [];

    return allOptions
      .flatMap((option) => {
        const alias = option.aliases.find((item) => normalize(item).includes(normalizedQuery) || normalizedQuery.includes(normalize(item)));
        const labelMatches = normalize(option.label).includes(normalizedQuery);
        const compactMatches = normalize(option.label).replace(/\s+/g, "").includes(normalizedQuery.replace(/\s+/g, ""));
        if (!alias && !labelMatches && !compactMatches) return [];
        return [{ ...option, alias }];
      })
      .slice(0, 8);
  }, [allOptions, normalizedQuery]);

  const fallbackValue = query.trim() ? canonicalizeTag(kind, query) : "";
  const showFallback = Boolean(
    fallbackValue &&
      !selectedValues.includes(fallbackValue) &&
      !suggestions.some((option) => option.value === fallbackValue),
  );

  // TODO: Add an admin taxonomy review page for approving, merging, or removing custom terms.
  function addValue(value: string) {
    const canonical = canonicalizeTag(kind, value);
    setSelectedValues((current) => (
      current.includes(canonical) ? current : [...current, canonical]
    ));
    setQuery("");
    setOpen(false);
  }

  function removeValue(value: string) {
    setSelectedValues((current) => current.filter((item) => item !== value));
  }

  return (
    <div className="text-sm font-bold text-[#0F172A]">
      <label htmlFor={id}>{label}</label>
      <div className="relative mt-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white focus-within:border-[#0055FF] focus-within:ring-4 focus-within:ring-[#0055FF]/10">
          <Input
            id={id}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            placeholder={placeholder}
            className="border-0 bg-transparent shadow-none focus:ring-0"
            autoComplete="off"
          />
        </div>

        {open && (suggestions.length || showFallback) ? (
          <div className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
            {suggestions.map((option) => {
              const aliasMatch = option.alias ?? getTagAliasMatch(kind, query)?.alias;
              return (
                <button
                  key={option.value}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addValue(option.value)}
                  disabled={selectedValues.includes(option.value)}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="block">{option.label}</span>
                  {aliasMatch ? (
                    <span className="mt-0.5 block text-xs font-medium text-[#64748B]">
                      matches: {aliasMatch}
                    </span>
                  ) : null}
                </button>
              );
            })}
            {showFallback ? (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addValue(fallbackValue)}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-[#0055FF] transition-colors hover:bg-[#F8FAFC]"
              >
                Search for: {query.trim()}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {selectedValues.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedValues.map((value) => (
            <span key={value} className="inline-flex items-center gap-1.5 rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-black text-[#0F172A]">
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                className="rounded-full text-[#64748B] transition-colors hover:text-[#FF3366] focus-visible:outline-2 focus-visible:outline-[#0055FF]"
                aria-label={`Remove ${value}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
              <input type="hidden" name={name} value={value} />
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

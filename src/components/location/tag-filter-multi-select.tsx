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
  const [selectedValues, setSelectedValues] = useState(() => (
    Array.from(new Set(selected.map((value) => canonicalizeTag(kind, value)).filter(Boolean)))
  ));
  const allOptions = useMemo(() => buildTagOptions(kind, options), [kind, options]);
  const normalizedQuery = normalize(query);

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!normalizedQuery) return allOptions.slice(0, 8);

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

  function addValue(value: string) {
    const canonical = canonicalizeTag(kind, value);
    setSelectedValues((current) => (
      current.includes(canonical) ? current : [...current, canonical]
    ));
    setQuery("");
  }

  function removeValue(value: string) {
    setSelectedValues((current) => current.filter((item) => item !== value));
  }

  return (
    <div className="text-sm font-bold text-[#0F172A]">
      <label htmlFor={id}>{label}</label>
      <div className="mt-2 space-y-3">
        <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-2 focus-within:border-[#0055FF] focus-within:ring-4 focus-within:ring-[#0055FF]/10">
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
          <Input
            id={id}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={selectedValues.length ? "Add another" : placeholder}
            className="min-w-40 flex-1 border-0 bg-transparent px-0 py-1 shadow-none focus:ring-0"
            autoComplete="off"
          />
        </div>

        {query || suggestions.length ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-sm">
            {suggestions.map((option) => {
              const aliasMatch = option.alias ?? getTagAliasMatch(kind, query)?.alias;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => addValue(option.value)}
                  disabled={selectedValues.includes(option.value)}
                  className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="block">{option.label}</span>
                  {aliasMatch ? (
                    <span className="mt-0.5 block text-xs font-medium text-[#64748B]">
                      matches: {aliasMatch}
                    </span>
                  ) : option.custom ? (
                    <span className="mt-0.5 block text-xs font-medium text-[#64748B]">
                      custom term
                    </span>
                  ) : null}
                </button>
              );
            })}
            {showFallback ? (
              <button
                type="button"
                onClick={() => addValue(fallbackValue)}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm font-bold text-[#0055FF] transition-colors hover:bg-[#F8FAFC]"
              >
                Search for: {query.trim()}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-xs font-medium text-[#64748B]">
        TODO: Custom terms should be reviewable in a future admin taxonomy page.
      </p>
    </div>
  );
}

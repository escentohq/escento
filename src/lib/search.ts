function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function searchTokens(value: string) {
  return normalizeSearchText(value).split(/\s+/).filter(Boolean);
}

function isOneEditOrSwapAway(a: string, b: string) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;

  if (a.length === b.length) {
    let differences = 0;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) differences += 1;
      if (differences > 2) return false;
    }

    if (differences <= 1) return true;

    for (let i = 0; i < a.length - 1; i += 1) {
      if (
        a[i] !== b[i] &&
        a[i + 1] !== b[i + 1] &&
        a[i] === b[i + 1] &&
        a[i + 1] === b[i] &&
        a.slice(0, i) === b.slice(0, i) &&
        a.slice(i + 2) === b.slice(i + 2)
      ) {
        return true;
      }
    }

    return false;
  }

  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;
  let i = 0;
  let j = 0;
  let skipped = false;

  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i += 1;
      j += 1;
    } else if (skipped) {
      return false;
    } else {
      skipped = true;
      j += 1;
    }
  }

  return true;
}

export function filterSearchResults<T>(
  rows: T[],
  query: string,
  getFields: (row: T) => Array<string | null | undefined>,
) {
  const normalizedQuery = normalizeSearchText(query);
  const queryTerms = searchTokens(query).filter((term) => term.length >= 2);

  if (!normalizedQuery || !queryTerms.length) return rows;

  return rows
    .map((row, index) => {
      const fields = getFields(row).filter(Boolean).join(" ");
      const normalizedFields = normalizeSearchText(fields);
      if (normalizedFields.includes(normalizedQuery)) {
        return { row, index, rank: 0 };
      }

      const fieldTokens = searchTokens(fields).filter((token) => token.length >= 3);
      const isNearMatch = queryTerms.every((term) => (
        term.length >= 3 &&
        fieldTokens.some((token) => isOneEditOrSwapAway(term, token))
      ));

      return isNearMatch ? { row, index, rank: 1 } : null;
    })
    .filter((result): result is { row: T; index: number; rank: number } => Boolean(result))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((result) => result.row);
}

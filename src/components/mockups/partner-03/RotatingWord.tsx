"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RotatingWordProps = {
  words: string[];
  intervalMs?: number;
  mobileCycles?: number;
};

const TRANSITION_MS = 360;

export function RotatingWord({
  words,
  intervalMs = 2800,
  mobileCycles = 4,
}: RotatingWordProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  const widestWord = useMemo(
    () => words.reduce((widest, word) => Math.max(widest, word.length), 0),
    [words],
  );

  const advance = useCallback(() => {
    if (words.length < 2 || isAnimating) return;

    const nextIndex = (currentIndex + 1) % words.length;
    setIncomingIndex(nextIndex);
    setIsAnimating(true);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setCurrentIndex(nextIndex);
      setIncomingIndex(null);
      setIsAnimating(false);
      setCompletedCycles((value) => value + 1);
    }, TRANSITION_MS);
  }, [currentIndex, isAnimating, words.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 640px)");

    const syncPreferences = () => {
      setPrefersReducedMotion(reducedMotionQuery.matches);
      setIsMobile(mobileQuery.matches);
    };

    syncPreferences();

    reducedMotionQuery.addEventListener("change", syncPreferences);
    mobileQuery.addEventListener("change", syncPreferences);

    return () => {
      reducedMotionQuery.removeEventListener("change", syncPreferences);
      mobileQuery.removeEventListener("change", syncPreferences);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || words.length < 2) return;
    if (isMobile && completedCycles >= mobileCycles) return;

    const intervalId = window.setInterval(() => {
      advance();
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [advance, completedCycles, intervalMs, isMobile, mobileCycles, prefersReducedMotion, words.length]);

  const sharedWrapperClass =
    "relative inline-grid min-h-[1.05em] align-baseline leading-none";
  const wordClass =
    "col-start-1 row-start-1 italic text-(--accent-red) transition-all duration-[360ms] ease-[cubic-bezier(0.32,0.72,0,1)]";

  const currentWord = (
    <span
      aria-live="polite"
      className={`${wordClass} ${isAnimating ? "translate-y-1 opacity-0" : "translate-y-0 opacity-100"}`}
    >
      {words[currentIndex]}
    </span>
  );

  const incomingWord =
    incomingIndex !== null ? (
      <span
        className={`${wordClass} pointer-events-none ${isAnimating ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
      >
        {words[incomingIndex]}
      </span>
    ) : null;

  if (prefersReducedMotion) {
    return (
      <button
        type="button"
        onClick={advance}
        className={`${sharedWrapperClass} cursor-pointer bg-transparent p-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-red) focus-visible:ring-offset-2 focus-visible:ring-offset-(--paper-bg)`}
        style={{ minWidth: `${widestWord}ch` }}
        aria-label="Cycle through featured instruments"
      >
        {currentWord}
        {incomingWord}
      </button>
    );
  }

  return (
    <span className={sharedWrapperClass} style={{ minWidth: `${widestWord}ch` }}>
      {currentWord}
      {incomingWord}
    </span>
  );
}

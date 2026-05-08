import { useCallback, useEffect, useState } from "react";
import { HERO_HOME_SLIDE_COUNT } from "./heroHomeSlides.js";

const HOLD_MIN_MS = 6000;
const HOLD_MAX_MS = 7800;

function randomHoldMs() {
  return HOLD_MIN_MS + Math.random() * (HOLD_MAX_MS - HOLD_MIN_MS);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Shared slide index for hero image + content section.
 * @param {boolean} userPaused - Hover or focus within hero pauses autoplay
 */
export function useHeroHomeSlideshow(userPaused = false) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  const goToIndex = useCallback((index) => {
    const n = HERO_HOME_SLIDE_COUNT;
    if (n <= 0) return;
    setActiveIndex(((index % n) + n) % n);
  }, []);

  const nextSlide = useCallback(() => {
    goToIndex(activeIndex + 1);
  }, [activeIndex, goToIndex]);

  const prevSlide = useCallback(() => {
    goToIndex(activeIndex - 1);
  }, [activeIndex, goToIndex]);

  useEffect(() => {
    if (reducedMotion || userPaused || HERO_HOME_SLIDE_COUNT <= 1) return;

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((i) => (i + 1) % HERO_HOME_SLIDE_COUNT);
    }, randomHoldMs());

    return () => clearTimeout(timeoutId);
  }, [activeIndex, reducedMotion, userPaused]);

  return {
    activeIndex,
    goToIndex,
    nextSlide,
    prevSlide,
    reducedMotion,
  };
}

import { useEffect, useState } from "react";

function useCountUp(target, run) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run || target == null || target < 0) {
      setN(target ?? 0);
      return;
    }
    setN(0);
    const start = performance.now();
    const dur = 1000;
    let id;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - (1 - p) ** 2.8;
      setN(Math.round(target * eased));
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, run]);
  return n;
}

/** @returns {number | null} count-up target (floored milestone when using + display) */
function intlAnimTarget(total) {
  if (total == null || Number.isNaN(total)) return null;
  if (total < 1000) return total;
  return Math.floor(total / 1000) * 1000;
}

/** Sri Lanka: floor to 50s from 250 up (e.g. 275 → 250+, 320 → 300+). */
function slAnimTarget(total) {
  if (total == null || Number.isNaN(total)) return null;
  if (total < 250) return total;
  return Math.floor(total / 50) * 50;
}

function formatIntl(animated, trueTotal) {
  if (trueTotal == null || Number.isNaN(trueTotal)) return "…";
  if (animated == null || Number.isNaN(animated)) return "…";
  if (trueTotal < 1000) return Math.round(animated).toLocaleString("en");
  const bucket = Math.floor(trueTotal / 1000) * 1000;
  if (animated >= bucket) return `${bucket}+`;
  return Math.round(animated).toLocaleString("en");
}

function formatSl(animated, trueTotal) {
  if (trueTotal == null || Number.isNaN(trueTotal)) return "…";
  if (animated == null || Number.isNaN(animated)) return "…";
  if (trueTotal < 250) return Math.round(animated).toLocaleString("en");
  const bucket = slAnimTarget(trueTotal);
  if (bucket != null && animated >= bucket) return `${bucket}+`;
  return Math.round(animated).toLocaleString("en");
}

/** Live API-backed stats + status pulse for the cinematic hero */
export default function HeroLiveMetrics({ intlTotal, slTotal, loading, reducedMotion }) {
  const animate = !loading && !reducedMotion && intlTotal != null;
  const nIntl = useCountUp(intlAnimTarget(intlTotal) ?? 0, animate);
  const nSl = useCountUp(slAnimTarget(slTotal) ?? 0, animate);

  const showIntl = loading ? null : reducedMotion ? intlAnimTarget(intlTotal) ?? intlTotal : nIntl;
  const showSl = loading ? null : reducedMotion ? slAnimTarget(slTotal) ?? slTotal : nSl;

  return (
    <div className="hero-cinematic-live" role="status" aria-live="polite" aria-atomic="true">
      <span className="hero-cinematic-live-pill">
        <span className="hero-cinematic-live-dot" aria-hidden />
        <span className="hero-cinematic-live-pill-text">
          {loading ? "Syncing index" : "Catalog online"}
        </span>
      </span>
      <span className="hero-cinematic-live-sep" aria-hidden>
        |
      </span>
      <span className="hero-cinematic-live-metric">
        <span className="hero-cinematic-live-num">{formatIntl(showIntl, intlTotal)}</span>
        <span className="hero-cinematic-live-metric-label"> International</span>
      </span>
      <span className="hero-cinematic-live-sep" aria-hidden>
        |
      </span>
      <span className="hero-cinematic-live-metric">
        <span className="hero-cinematic-live-num">{formatSl(showSl, slTotal)}</span>
        <span className="hero-cinematic-live-metric-label"> Sri Lanka</span>
      </span>
    </div>
  );
}

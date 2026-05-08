import { useEffect, useRef } from "react";

function parseCssColor(value) {
  const s = value.trim();
  const rgb = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    return { r: +rgb[1], g: +rgb[2], b: +rgb[3] };
  }
  const hex = s.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hex) {
    return {
      r: parseInt(hex[1], 16),
      g: parseInt(hex[2], 16),
      b: parseInt(hex[3], 16),
    };
  }
  const short = s.match(/^#?([a-f\d])([a-f\d])([a-f\d])$/i);
  if (short) {
    return {
      r: parseInt(short[1] + short[1], 16),
      g: parseInt(short[2] + short[2], 16),
      b: parseInt(short[3] + short[3], 16),
    };
  }
  return { r: 37, g: 99, b: 235 };
}

function readThemeColors() {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  return {
    accent: parseCssColor(cs.getPropertyValue("--accent")),
    subtle: parseCssColor(cs.getPropertyValue("--text-tertiary")),
  };
}

/** Normalized velocity scale per frame (~60fps). Lower = slower drift across the viewport. */
const DRIFT_SPEED = 0.002;

/** Still drifts when prefers-reduced-motion (very subtle, non-bouncy). */
const DRIFT_SPEED_REDUCED = 0.00045;

function wrapUnit(v) {
  v %= 1;
  return v < 0 ? v + 1 : v;
}

/**
 * Fixed full-viewport canvas: drifting nodes + distance-based edges (neural-net look).
 * Uses --accent / --text-tertiary so it tracks light/dark theme.
 */
export default function NeuralNetworkBackground() {
  const canvasRef = useRef(null);
  const colorsRef = useRef(readThemeColors());
  const reduceRef = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let nodes = [];

    const syncColors = () => {
      colorsRef.current = readThemeColors();
    };

    const mo = new MutationObserver(syncColors);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    const driftSpeed = () => (reduceRef.current ? DRIFT_SPEED_REDUCED : DRIFT_SPEED);

    const initNodes = (cw, ch) => {
      const area = cw * ch;
      const count = Math.min(64, Math.max(24, Math.floor(area / 17500)));
      const speed = driftSpeed();
      nodes = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
      }));
    };

    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduceChange = () => {
      reduceRef.current = mqReduce.matches;
      const speed = driftSpeed();
      for (const n of nodes) {
        n.vx = (Math.random() - 0.5) * speed;
        n.vy = (Math.random() - 0.5) * speed;
      }
    };
    mqReduce.addEventListener("change", onReduceChange);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes(w, h);
      syncColors();
    };

    const step = () => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      if (cw < 2 || ch < 2) {
        raf = requestAnimationFrame(step);
        return;
      }

      const { accent, subtle } = colorsRef.current;
      const linkDist = Math.min(cw, ch) * 0.135;

      ctx.clearRect(0, 0, cw, ch);

      for (const n of nodes) {
        n.x = wrapUnit(n.x + n.vx);
        n.y = wrapUnit(n.y + n.vy);
      }

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const ni = nodes[i];
          const nj = nodes[j];
          const ax = ni.x * cw;
          const ay = ni.y * ch;
          const bx = nj.x * cw;
          const by = nj.y * ch;
          const d = Math.hypot(ax - bx, ay - by);
          if (d < linkDist) {
            const t = 1 - d / linkDist;
            const alpha = t * 0.22;
            ctx.strokeStyle = `rgba(${accent.r},${accent.g},${accent.b},${alpha})`;
            ctx.lineWidth = 1.15;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const x = n.x * cw;
        const y = n.y * ch;
        ctx.fillStyle = `rgba(${accent.r},${accent.g},${accent.b},0.36)`;
        ctx.beginPath();
        ctx.arc(x, y, 2.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${subtle.r},${subtle.g},${subtle.b},0.24)`;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      mqReduce.removeEventListener("change", onReduceChange);
      mo.disconnect();
    };
  }, []);

  return (
    <div className="page-bg-neural" aria-hidden="true">
      <canvas ref={canvasRef} className="page-bg-neural-canvas" />
    </div>
  );
}

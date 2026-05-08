import { useEffect, useState } from "react";

const THEME_KEY = "edura-theme";

function getInitialTheme() {
  if (typeof document === "undefined") return "light";
  const t = document.documentElement.getAttribute("data-theme");
  return t === "dark" ? "dark" : "light";
}

function IconSun() {
  return (
    <svg
      className="theme-toggle-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg
      className="theme-toggle-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <div className="theme-toggle-wrap" role="group" aria-label="Theme">
      <span
        className={`theme-toggle-symbol${!isDark ? " theme-toggle-symbol--active" : ""}`}
        title="Light"
      >
        <IconSun />
      </span>
      <button
        type="button"
        className="theme-toggle"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        <span className="theme-toggle-track">
          <span className="theme-toggle-thumb" aria-hidden />
        </span>
      </button>
      <span
        className={`theme-toggle-symbol${isDark ? " theme-toggle-symbol--active" : ""}`}
        title="Dark"
      >
        <IconMoon />
      </span>
    </div>
  );
}

import { HERO_HOME_SLIDE_CONTENT, HERO_HOME_SLIDE_COUNT } from "../hero/heroHomeSlides.js";

export default function HeroHomeSpotlight({
  activeIndex,
  onSelect,
  onPrev,
  onNext,
  reducedMotion,
}) {
  const slide = HERO_HOME_SLIDE_CONTENT[activeIndex];
  if (!slide) return null;

  const countLabel = String(HERO_HOME_SLIDE_COUNT).padStart(2, "0");
  const indexLabel = String(activeIndex + 1).padStart(2, "0");

  return (
    <div className="hero-home-spotlight">
      <div
        className="hero-home-spotlight-text"
        key={activeIndex}
        aria-live={reducedMotion ? "off" : "polite"}
        aria-atomic="true"
      >
        <p className="hero-home-spotlight-meta">
          <span className="hero-home-spotlight-eyebrow">{slide.eyebrow}</span>
          <span className="hero-home-spotlight-counter" aria-hidden="true">
            {indexLabel}
            <span className="hero-home-spotlight-counter-sep">/</span>
            {countLabel}
          </span>
        </p>
        <p className="hero-home-spotlight-title">{slide.headline}</p>
        <p className="hero-home-spotlight-desc">{slide.description}</p>
      </div>

      <div className="hero-home-spotlight-controls">
        <div className="hero-home-spotlight-nav">
          <button
            type="button"
            className="hero-home-spotlight-arrow"
            onClick={onPrev}
            aria-label="Previous highlight"
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            className="hero-home-spotlight-arrow"
            onClick={onNext}
            aria-label="Next highlight"
          >
            <span aria-hidden>›</span>
          </button>
        </div>
        <div className="hero-home-spotlight-dots" role="group" aria-label="Highlight slides">
          {HERO_HOME_SLIDE_CONTENT.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show highlight ${i + 1} of ${HERO_HOME_SLIDE_COUNT}`}
              aria-current={i === activeIndex ? "true" : undefined}
              className={`hero-home-spotlight-dot${i === activeIndex ? " is-active" : ""}`}
              onClick={() => onSelect(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

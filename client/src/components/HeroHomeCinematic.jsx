import { useState } from "react";
import { Link } from "react-router-dom";
import HeroLiveMetrics from "./HeroLiveMetrics.jsx";
import {
  HERO_HOME_FILES,
  HERO_HOME_OBJECT_POSITION,
  HERO_HOME_SLIDE_CONTENT,
  HERO_HOME_SLIDE_COUNT,
  HERO_HOME_TONES,
  HERO_SLIDER_REMOTE_FALLBACK,
  heroHomeSliderSrc,
} from "../hero/heroHomeSlides.js";

export default function HeroHomeCinematic({
  activeIndex,
  goToIndex,
  nextSlide,
  prevSlide,
  reducedMotion,
  editorialStamp,
  interactionProps,
  liveMetrics,
}) {
  const [failed, setFailed] = useState(() =>
    Object.fromEntries(HERO_HOME_FILES.map((f) => [f, false])),
  );
  const slide = HERO_HOME_SLIDE_CONTENT[activeIndex];

  return (
    <header className="hero hero--home hero--cinematic" aria-labelledby="hero-heading">
      <div className="hero-cinematic-layers" aria-hidden="true">
        {HERO_HOME_FILES.map((file, i) => (
          <div
            key={file}
            className={`hero-cinematic-slide ${HERO_HOME_TONES[i % HERO_HOME_TONES.length]}${
              i === activeIndex ? " is-active" : ""
            }${failed[file] ? " is-fallback-only" : ""}`}
          >
            {!failed[file] ? (
              <img
                className="hero-cinematic-img"
                src={heroHomeSliderSrc(file)}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                style={{
                  objectPosition: HERO_HOME_OBJECT_POSITION[file] ?? "center 42%",
                }}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const el = e.currentTarget;
                  const remote = HERO_SLIDER_REMOTE_FALLBACK[file];
                  if (remote && el.dataset.fallbackTried !== "1") {
                    el.dataset.fallbackTried = "1";
                    el.src = remote;
                    return;
                  }
                  setFailed((prev) => ({ ...prev, [file]: true }));
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="hero-cinematic-scrim" aria-hidden="true" />
      <div className="hero-cinematic-vignette" aria-hidden="true" />
      <div className="hero-cinematic-tech" aria-hidden="true">
        <div className="hero-cinematic-tech-grid" />
        <div className="hero-cinematic-tech-scan" />
      </div>

      <div className="hero-cinematic-stage" {...interactionProps}>
        {slide ? (
          <div
            className="hero-cinematic-copy"
            key={activeIndex}
            aria-live={reducedMotion ? "off" : "polite"}
            aria-atomic="true"
          >
            {liveMetrics ? (
              <HeroLiveMetrics
                intlTotal={liveMetrics.intlTotal}
                slTotal={liveMetrics.slTotal}
                loading={liveMetrics.loading}
                reducedMotion={reducedMotion}
              />
            ) : null}
            <p className="hero-cinematic-eyebrow">{slide.eyebrow}</p>
            <h1 id="hero-heading" className="hero-cinematic-headline">
              {slide.headline}
            </h1>
            <p className="hero-cinematic-desc">{slide.description}</p>
            <div className="hero-cinematic-ctas">
              <Link
                className="hero-cinematic-btn hero-cinematic-btn--primary"
                to={slide.primaryCta.to}
              >
                {slide.primaryCta.label}
              </Link>
              {slide.secondaryCta ? (
                <Link
                  className="hero-cinematic-btn hero-cinematic-btn--secondary"
                  to={slide.secondaryCta.to}
                >
                  {slide.secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="hero-cinematic-arrows">
          <button
            type="button"
            className="hero-cinematic-arrow hero-cinematic-arrow--prev"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <span className="hero-cinematic-arrow-icon" aria-hidden />
          </button>
          <button
            type="button"
            className="hero-cinematic-arrow hero-cinematic-arrow--next"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <span className="hero-cinematic-arrow-icon hero-cinematic-arrow-icon--next" aria-hidden />
          </button>
        </div>

        <div className="hero-cinematic-bottom">
          <div className="hero-cinematic-dots" role="group" aria-label="Slides">
            {HERO_HOME_SLIDE_CONTENT.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`hero-cinematic-dot${i === activeIndex ? " is-active" : ""}`}
                aria-label={`Go to slide ${i + 1} of ${HERO_HOME_SLIDE_COUNT}`}
                aria-current={i === activeIndex ? "true" : undefined}
                onClick={() => goToIndex(i)}
              />
            ))}
          </div>
          <p className="hero-cinematic-byline">
            <span className="hero-cinematic-byline-wordmark">
              Edura
              <sup className="brand-wordmark-sup brand-wordmark-sup--hero">LK</sup>
            </span>
            <span className="hero-cinematic-byline-sep" aria-hidden>
              ·
            </span>
            <time dateTime={editorialStamp.dateTime}>{editorialStamp.label}</time>
          </p>
        </div>
      </div>
    </header>
  );
}

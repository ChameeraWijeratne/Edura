import { useState } from "react";
import {
  HERO_HOME_FILES,
  HERO_HOME_OBJECT_POSITION,
  HERO_HOME_SLIDE_CONTENT,
  HERO_HOME_TONES,
  HERO_SLIDER_REMOTE_FALLBACK,
  heroHomeSliderSrc,
} from "../hero/heroHomeSlides.js";

/** Framed square preview, synced with hero content-section slideshow. */
export default function HeroHomeFramedPreview({ activeIndex }) {
  const [failed, setFailed] = useState(() =>
    Object.fromEntries(HERO_HOME_FILES.map((f) => [f, false])),
  );

  return (
    <div className="hero-home-framed">
      <div className="hero-home-framed-ring" aria-hidden />
      <div className="hero-home-framed-inner">
        <div className="hero-home-framed-layers">
          {HERO_HOME_FILES.map((file, i) => (
            <div
              key={file}
              className={`hero-home-framed-layer ${HERO_HOME_TONES[i % HERO_HOME_TONES.length]}${
                i === activeIndex ? " is-visible" : ""
              }${failed[file] ? " is-fallback-only" : ""}`}
              style={{ zIndex: i === activeIndex ? 10 : i }}
              aria-hidden={i !== activeIndex}
            >
              {!failed[file] ? (
                <img
                  src={heroHomeSliderSrc(file)}
                  alt={
                    i === activeIndex
                      ? HERO_HOME_SLIDE_CONTENT[i]?.imageAlt ?? ""
                      : ""
                  }
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="hero-home-framed-img"
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
      </div>
    </div>
  );
}

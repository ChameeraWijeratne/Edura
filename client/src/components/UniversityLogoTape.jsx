import { useState } from "react";
import INSTITUTIONS from "../data/tapeInstitutions.json";

function initials(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function TapeLogo({ name, domain }) {
  const [broken, setBroken] = useState(false);
  const src = `https://icons.duckduckgo.com/ip3/${domain}.ico`;

  return (
    <li className="uni-tape-item">
      <span className="uni-tape-item-inner">
        {broken ? (
          <span className="uni-tape-fallback" aria-hidden>
            {initials(name)}
          </span>
        ) : (
          <img
            className="uni-tape-img"
            src={src}
            alt=""
            width={28}
            height={28}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        )}
        <span className="uni-tape-name">{name}</span>
      </span>
    </li>
  );
}

function TapeStrip() {
  return (
    <ul className="uni-tape-strip">
      {INSTITUTIONS.map((inst) => (
        <TapeLogo key={inst.domain} name={inst.name} domain={inst.domain} />
      ))}
    </ul>
  );
}

export default function UniversityLogoTape({ placement }) {
  const labelId = "uni-tape-heading";
  const afterHero = placement === "afterHero";

  return (
    <section
      className={`uni-tape${afterHero ? " uni-tape--after-hero" : ""}`}
      aria-labelledby={labelId}
    >
      <div className="uni-tape-inner">
        <p id={labelId} className="uni-tape-label">
          Trusted by learners exploring courses from leading schools
        </p>
        <div className="uni-tape-viewport">
          <div className="uni-tape-track" aria-hidden="true">
            <TapeStrip />
            <ul className="uni-tape-strip uni-tape-strip--clone">
              {INSTITUTIONS.map((inst) => (
                <TapeLogo key={`clone-${inst.domain}`} name={inst.name} domain={inst.domain} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export const HERO_HOME_FILES = [
  "edu-woman-student-study.jpg",
  "edu-campus-university.jpg",
  "edu-classroom-students.jpg",
  "edu-library-reading.jpg",
];

/**
 * If `/slider/*.jpg` is missing (404), the hero swaps to these Unsplash URLs.
 * Same photos as in `public/slider/ATTRIBUTION.txt` (classroom uses a fresher group-study shot).
 */
export const HERO_SLIDER_REMOTE_FALLBACK = {
  "edu-library-reading.jpg":
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=2400&q=85",
  "edu-campus-university.jpg":
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2400&q=85",
  "edu-classroom-students.jpg":
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2400&q=85",
  "edu-woman-student-study.jpg":
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=2400&q=85",
};

/**
 * Cinematic hero slides (aligned with HERO_HOME_FILES).
 * headline = large display line; eyebrow = small caps line above.
 */
export const HERO_HOME_SLIDE_CONTENT = [
  {
    eyebrow: "Your next step",
    headline: "From browse to enroll",
    description:
      "Less noise, clearer next steps, and a catalog designed to respect your time.",
    imageAlt: "Student working at a laptop in a bright, focused study setting",
    primaryCta: { label: "View courses", to: "/courses" },
    secondaryCta: { label: "Sri Lanka", to: "/sri-lanka" },
  },
  {
    eyebrow: "Trusted sources",
    headline: "Official links, not blog spam",
    description:
      "Every course opens the real enrollment page so you can compare and sign up without dead ends.",
    imageAlt: "University campus buildings and walkways on a clear day",
    primaryCta: { label: "International catalog", to: "/courses" },
    secondaryCta: { label: "About Edura", to: "/about" },
  },
  {
    eyebrow: "How you search today",
    headline: "Built for discovery",
    description:
      "Subject, school, and region filters, including a dedicated path when you are focused on Sri Lanka.",
    imageAlt: "Students collaborating and studying together",
    primaryCta: { label: "Start exploring", to: "/courses" },
    secondaryCta: { label: "Contact", to: "/contact" },
  },
  {
    eyebrow: "Curated for students",
    headline: "University learning, simplified",
    description:
      "Explore real programs from recognized schools. Filters, clarity, and one tap to the provider’s official page.",
    imageAlt: "Curved library shelves filled with books in soft light",
    primaryCta: { label: "Browse courses", to: "/courses" },
    secondaryCta: { label: "Sri Lanka catalog", to: "/sri-lanka" },
  },
];

export const HERO_HOME_TONES = [
  "hero-home-bg-tone--a",
  "hero-home-bg-tone--b",
  "hero-home-bg-tone--c",
  "hero-home-bg-tone--d",
];

/** Favor subject matter; books/library shots sit left; anchor left to avoid empty grey. */
export const HERO_HOME_OBJECT_POSITION = {
  "edu-library-reading.jpg": "32% 48%",
  "edu-campus-university.jpg": "52% 42%",
  "edu-classroom-students.jpg": "50% 40%",
  "edu-woman-student-study.jpg": "36% 42%",
};

export function heroHomePublicSliderUrl(filename) {
  const base = import.meta.env.BASE_URL ?? "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  return `${root}slider/${filename}`;
}

/** Primary: Vite `public/slider/` (copied to site root). */
export function heroHomeSliderSrc(filename) {
  return heroHomePublicSliderUrl(filename);
}

export const HERO_HOME_SLIDE_COUNT = HERO_HOME_FILES.length;

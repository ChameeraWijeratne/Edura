import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson } from "../api.js";
import CourseCard from "../components/CourseCard.jsx";
import HeroHomeCinematic from "../components/HeroHomeCinematic.jsx";
import { useHeroHomeSlideshow } from "../hero/useHeroHomeSlideshow.js";
import TestimonialsSection from "../components/TestimonialsSection.jsx";
import BestStoriesSection from "../components/BestStoriesSection.jsx";
import UniversityLogoTape from "../components/UniversityLogoTape.jsx";

const FEATURED_COUNT = 10;

function editorialMonthStamp() {
  const d = new Date();
  return {
    label: d.toLocaleString("en", { month: "short", year: "numeric" }),
    dateTime: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
  };
}

export default function HomePage() {
  const [heroPause, setHeroPause] = useState(false);
  const { activeIndex, goToIndex, nextSlide, prevSlide, reducedMotion } =
    useHeroHomeSlideshow(heroPause);
  const editorialStamp = editorialMonthStamp();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intlTotal, setIntlTotal] = useState(null);
  const [slTotal, setSlTotal] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [courses, slCourses] = await Promise.all([
          fetchJson("/api/courses"),
          fetchJson("/api/sri-lanka/courses"),
        ]);
        if (cancelled) return;
        const list = Array.isArray(courses) ? courses : [];
        const slList = Array.isArray(slCourses) ? slCourses : [];
        setFeatured(list.slice(0, FEATURED_COUNT));
        setIntlTotal(list.length);
        setSlTotal(slList.length);
      } catch {
        if (!cancelled) {
          setFeatured([]);
          setIntlTotal(0);
          setSlTotal(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setMetricsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page page--home">
      <div className="hero-home-shell">
        <HeroHomeCinematic
          activeIndex={activeIndex}
          goToIndex={goToIndex}
          nextSlide={nextSlide}
          prevSlide={prevSlide}
          reducedMotion={reducedMotion}
          editorialStamp={editorialStamp}
          liveMetrics={{
            intlTotal,
            slTotal,
            loading: metricsLoading,
          }}
          interactionProps={{
            onPointerEnter: () => setHeroPause(true),
            onPointerLeave: () => setHeroPause(false),
            onFocusCapture: () => setHeroPause(true),
            onBlurCapture: (e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setHeroPause(false);
            },
          }}
        />
      </div>

      <UniversityLogoTape placement="afterHero" />

      <main id="main-content" className="main main--home">
        <section className="section section-featured" aria-labelledby="featured-heading">
          <div className="section-inner">
            <div className="section-head section-head--row">
              <div>
                <p className="eyebrow section-eyebrow">Start here</p>
                <h2 id="featured-heading" className="section-title">
                  Courses students are exploring
                </h2>
                <p className="section-lead section-lead--tight">
                  Hand-picked picks from the full catalog, with a mix of subjects and schools so
                  you can see what is possible before you dive into filters.
                </p>
              </div>
            </div>

            {loading ? (
              <p className="section-loading">Loading featured courses…</p>
            ) : (
              <div className="grid grid--featured">
                {featured.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            )}

            <div className="section-cta-row section-cta-row--split">
              <Link className="btn btn-primary btn-lg" to="/courses">
                More international courses
                <span className="btn-chevron" aria-hidden>
                  →
                </span>
              </Link>
              <Link className="btn btn-secondary btn-lg" to="/sri-lanka">
                Sri Lanka catalog
              </Link>
            </div>
          </div>
        </section>

        <TestimonialsSection />
        <BestStoriesSection />
      </main>
    </div>
  );
}

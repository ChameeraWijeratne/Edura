/**
 * Home hero: solid professional blue field (no full-bleed slideshow).
 * Photo slideshow lives only in HeroHomeFramedPreview.
 */
export default function HeroHomeBackdrop() {
  return (
    <div className="hero-home-bg" aria-hidden="true">
      <div className="hero-home-bg-solid" />
      <div className="hero-home-mesh" aria-hidden />
      <div className="hero-home-bg-vignette" aria-hidden />
      <div className="hero-home-bg-scrim" />
    </div>
  );
}

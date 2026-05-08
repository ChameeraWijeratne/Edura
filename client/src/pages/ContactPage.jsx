import ContactMessageForm from "../components/ContactMessageForm.jsx";

export default function ContactPage() {
  return (
    <div className="page">
      <header
        className="page-hero page-hero--surface page-hero--contact"
        aria-labelledby="contact-heading"
      >
        <div className="page-hero-inner page-hero-inner--surface">
          <p className="eyebrow">We are here to help</p>
          <h1 id="contact-heading" className="page-hero-title">
            Contact us
          </h1>
          <p className="page-hero-lead">
            Send us a message. We read every note and reply as soon as we can.
          </p>
          <ul className="page-hero-badges" aria-label="Highlights">
            <li className="page-hero-badge">Human replies</li>
            <li className="page-hero-badge">Privacy-conscious</li>
            <li className="page-hero-badge">Sri Lanka–based team</li>
          </ul>
        </div>
      </header>

      <main id="main-content" className="main main--narrow">
        <div className="contact-layout">
          <ContactMessageForm idPrefix="contact-page" />

          <aside className="contact-aside" aria-label="Contact details">
            <div className="contact-card">
              <h2 className="contact-aside-title">Email us directly</h2>
              <p className="contact-aside-text">
                You can also write to us at{" "}
                <a href="mailto:hello@edura.example">hello@edura.example</a>.
              </p>
            </div>
            <div className="contact-card">
              <h2 className="contact-aside-title">Response time</h2>
              <p className="contact-aside-text">
                We aim to respond within a few business days. Thank you for your
                patience.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

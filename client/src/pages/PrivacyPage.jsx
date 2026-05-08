import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="page">
      <header
        className="page-hero page-hero--surface page-hero--privacy"
        aria-labelledby="privacy-heading"
      >
        <div className="page-hero-inner page-hero-inner--surface">
          <p className="eyebrow">Legal</p>
          <h1 id="privacy-heading" className="page-hero-title">
            Privacy policy
          </h1>
          <p className="page-hero-lead">
            How Edura handles information when you use our site. Last updated:
            April 13, 2026.
          </p>
          <ul className="page-hero-badges" aria-label="Highlights">
            <li className="page-hero-badge">Data minimization</li>
            <li className="page-hero-badge">No selling lists</li>
            <li className="page-hero-badge">Contact for questions</li>
          </ul>
        </div>
      </header>

      <main id="main-content" className="main main--article">
        <article className="prose">
          <h2>Who we are</h2>
          <p>
            Edura (“we”, “us”) operates the website that links to this policy
            (the “Site”). We run a public directory of university and similar
            courses and link out to third-party providers. We do not host course
            lessons or videos on the Site.
          </p>

          <h2>Information we collect</h2>
          <ul>
            <li>
              <strong>Theme preference.</strong> If you use light or dark mode,
              your choice may be stored in your browser (for example{" "}
              <code>localStorage</code>) so the Site remembers it on return
              visits. This stays on your device unless you clear site data.
            </li>
            <li>
              <strong>Contact form.</strong> If you use our contact form, we
              collect the name, email address, and message you submit so we can
              read and respond. These details may be stored on our servers (for
              example in a message log) and, if email is configured, sent to our
              mailbox.
            </li>
            <li>
              <strong>Technical data.</strong> Like most websites, our hosting
              and infrastructure may automatically process server logs (such as
              IP address, browser type, date and time of requests) for security
              and reliability. The exact items depend on how the Site is hosted.
            </li>
          </ul>

          <h2>How we use information</h2>
          <p>We use the information above to:</p>
          <ul>
            <li>Operate and improve the Site and respond to your messages;</li>
            <li>Remember your display preferences where applicable;</li>
            <li>Protect the Site against abuse and diagnose technical issues.</li>
          </ul>
          <p>We do not sell your personal information.</p>

          <h2>Third-party sites and courses</h2>
          <p>
            Listings link to websites operated by universities, platforms, and
            other providers. Those sites have their own privacy practices. We are
            not responsible for their policies or how they handle data when you
            leave Edura. Please review their terms and privacy notices before
            you sign up or share information with them.
          </p>

          <h2>Advertising and cookies</h2>
          <p>
            If we show third-party advertising (for example through Google
            AdSense or similar programs), those partners may use cookies or
            similar technologies to measure performance and, where allowed, to
            show personalized ads. You can learn how Google uses data in ads at{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google’s Advertising policies
            </a>{" "}
            and manage certain preferences through your browser or device
            settings and, where offered, industry opt-out tools.
          </p>
          <p>
            Until such advertising is active, only the practices described in
            “Information we collect” above apply.
          </p>

          <h2>Retention</h2>
          <p>
            We keep contact submissions only as long as needed to respond and for
            a reasonable period afterward for support and legal purposes, unless
            a longer period is required by law.
          </p>

          <h2>Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct,
            delete, or restrict processing of your personal data, or to object to
            certain processing. To exercise these rights, contact us using the
            details on our{" "}
            <Link to="/contact">Contact</Link> page. We may need to verify your
            request.
          </p>

          <h2>Children</h2>
          <p>
            The Site is intended for a general audience. If you believe we have
            collected information from a child in a way that should not have
            happened, please contact us and we will take appropriate steps.
          </p>

          <h2>International transfers</h2>
          <p>
            If you access the Site from outside the country where our servers or
            service providers are located, your information may be processed in
            those countries, which may have different data protection laws.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. We will post the new
            version on this page and adjust the “Last updated” date. Continued
            use of the Site after changes means you accept the updated policy.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about privacy: use our{" "}
            <Link to="/contact">Contact</Link> form or the email shown there.
          </p>

          <p className="prose-cta">
            <Link className="btn btn-primary" to="/">
              Home
            </Link>
            <Link className="btn btn-secondary" to="/terms">
              Terms of use
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}

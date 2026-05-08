import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="page">
      <header
        className="page-hero page-hero--surface page-hero--terms"
        aria-labelledby="terms-heading"
      >
        <div className="page-hero-inner page-hero-inner--surface">
          <p className="eyebrow">Legal</p>
          <h1 id="terms-heading" className="page-hero-title">
            Terms of use
          </h1>
          <p className="page-hero-lead">
            Rules for using Edura. Last updated: April 13, 2026.
          </p>
          <ul className="page-hero-badges" aria-label="Highlights">
            <li className="page-hero-badge">Directory service</li>
            <li className="page-hero-badge">Third-party sites</li>
            <li className="page-hero-badge">Accuracy disclaimer</li>
          </ul>
        </div>
      </header>

      <main id="main-content" className="main main--article">
        <article className="prose">
          <h2>Agreement</h2>
          <p>
            By accessing or using the Edura website (the “Site”), you agree to
            these Terms of Use. If you do not agree, do not use the Site.
          </p>

          <h2>What Edura provides</h2>
          <p>
            Edura offers a curated directory of courses and related information,
            with links to official pages on third-party websites (such as
            universities and learning platforms). We do not host course content,
            run enrollments, or process tuition on the Site.
          </p>

          <h2>No endorsement</h2>
          <p>
            Inclusion of a course or institution in our directory does not mean
            we endorse that provider, guarantee admission, or verify every detail
            at all times. Listings are for discovery only.
          </p>

          <h2>Third-party websites</h2>
          <p>
            When you follow a link to another site, you leave Edura. Those sites
            have their own terms, privacy policies, fees, and rules. You are
            responsible for reviewing them and for any agreement you enter with a
            provider. We are not a party to your relationship with third parties.
          </p>

          <h2>Accuracy and changes</h2>
          <p>
            We aim to keep listings useful and accurate, but course titles,
            prices, access rules, and availability can change without notice on
            the provider’s side. Always confirm critical information (including
            cost, certificates, and prerequisites) on the official course page
            before you enroll.
          </p>

          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>
              Use the Site in any way that violates applicable law or infringes
              others’ rights;
            </li>
            <li>
              Attempt to disrupt, overload, or gain unauthorized access to our
              systems or data;
            </li>
            <li>
              Scrape, harvest, or systematically copy the Site in a way that
              harms our service or violates our robots or rate limits, except as
              allowed by law;
            </li>
            <li>
              Misrepresent your affiliation with Edura or with any listed
              institution.
            </li>
          </ul>

          <h2>Intellectual property</h2>
          <p>
            The Site’s design, text, and compilation of listings (where original
            to us) are protected by applicable intellectual property laws. Course
            names and institutional names may be trademarks of their respective
            owners. You may not reuse our content in a way that suggests we
            sponsor or endorse you without permission.
          </p>

          <h2>Disclaimer of warranties</h2>
          <p>
            The Site is provided “as is” and “as available.” To the fullest
            extent permitted by law, we disclaim warranties of merchantability,
            fitness for a particular purpose, and non-infringement. We do not
            warrant that the Site will be uninterrupted or error-free.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, Edura and its operators will
            not be liable for any indirect, incidental, special, consequential,
            or punitive damages, or any loss of profits, data, or goodwill,
            arising from your use of the Site or reliance on any listing. Our
            total liability for any claim relating to the Site is limited to the
            greater of (a) the amount you paid us to use the Site in the twelve
            months before the claim or (b) zero if you did not pay us.
          </p>
          <p>
            Some jurisdictions do not allow certain limitations; in those places,
            our liability is limited to the maximum permitted by law.
          </p>

          <h2>Indemnity</h2>
          <p>
            You agree to defend and indemnify Edura and its operators against
            claims arising from your misuse of the Site or violation of these
            terms, to the extent permitted by law.
          </p>

          <h2>Changes to the Site and these terms</h2>
          <p>
            We may modify the Site or these terms at any time. We will post
            updated terms on this page and change the “Last updated” date.
            Continued use after changes constitutes acceptance of the new terms.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws applicable to the operator of
            the Site, without regard to conflict-of-law rules. Courts in that
            jurisdiction have exclusive venue, unless mandatory consumer laws in
            your country give you a right to sue elsewhere.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms: see our{" "}
            <Link to="/contact">Contact</Link> page.
          </p>

          <p className="prose-cta">
            <Link className="btn btn-primary" to="/">
              Home
            </Link>
            <Link className="btn btn-secondary" to="/privacy">
              Privacy policy
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}

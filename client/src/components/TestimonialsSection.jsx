const ITEMS = [
  {
    quote:
      "Between lectures I wanted one place to compare CS and data courses. Edura links straight to the real enroll pages. No random blogs.",
    name: "Amelia Chen",
    role: "Undergrad, computer science",
    initials: "AC",
  },
  {
    quote:
      "I am planning a career switch while working. Filters by subject and school help me shortlist audit-friendly options without opening twenty tabs.",
    name: "James Okonkwo",
    role: "Part-time learner, London",
    initials: "JO",
  },
  {
    quote:
      "Our study group shares Edura when someone asks ‘where is a legit free course?’ It feels built for learners, not ads.",
    name: "Sofia Martins",
    role: "Grad student, São Paulo",
    initials: "SM",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="section section-testimonials" aria-labelledby="testimonials-heading">
      <div className="section-inner">
        <div className="section-head">
          <p className="eyebrow section-eyebrow">From students and lifelong learners</p>
          <h2 id="testimonials-heading" className="section-title">
            Why people use Edura
          </h2>
          <p className="section-lead">
            Short stories from learners who wanted trusted links, less clutter, and a
            faster way to plan what to study next.
          </p>
        </div>
        <ul className="testimonial-grid">
          {ITEMS.map((t) => (
            <li key={t.name} className="testimonial-card">
              <blockquote className="testimonial-quote">“{t.quote}”</blockquote>
              <div className="testimonial-person">
                <span className="testimonial-avatar" aria-hidden>
                  {t.initials}
                </span>
                <div>
                  <p className="testimonial-name">{t.name}</p>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

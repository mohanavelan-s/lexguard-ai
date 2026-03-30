export default function SectionHero({ eyebrow, title, description, actions, className = "" }) {
  return (
    <section className={`hero-panel ${className}`.trim()}>
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h1>{title}</h1>
      <p>{description}</p>
      {actions ? <div className="hero-actions">{actions}</div> : null}
    </section>
  );
}

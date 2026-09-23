export function PagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <section className="page-placeholder">
      <p className="eyebrow">Paginita</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <span className="status-pill">En preparación</span>
    </section>
  );
}

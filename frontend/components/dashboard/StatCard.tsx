export default function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <section className="card stat-card">
      <p className="muted">{label}</p>
      <strong className="stat-value">{value}</strong>
      {detail ? <p className="muted">{detail}</p> : null}
    </section>
  );
}

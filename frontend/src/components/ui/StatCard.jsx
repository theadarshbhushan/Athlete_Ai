export default function StatCard({ eyebrow, title, value, suffix, description }) {
  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{eyebrow}</p>
      <div className="mt-4 flex items-end gap-2">
        <span className="font-display text-5xl uppercase text-slate-950">{value}</span>
        {suffix ? <span className="pb-2 text-sm text-slate-500">{suffix}</span> : null}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

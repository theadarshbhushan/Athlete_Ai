const colorMap = {
  low: 'bg-emerald-100 text-emerald-700',
  fresh: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-yellow-100 text-yellow-700',
  normal: 'bg-yellow-100 text-yellow-700',
  high: 'bg-blue-100 text-blue-700',
  fatigued: 'bg-blue-100 text-blue-700',
  overtrained: 'bg-red-100 text-red-700',
};

export default function RiskBadge({ level = 'Normal' }) {
  const normalized = level.toString().trim().toLowerCase();
  const classes = colorMap[normalized] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {level}
    </span>
  );
}

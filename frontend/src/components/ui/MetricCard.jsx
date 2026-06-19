import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: ArrowRight,
};

const trendColor = {
  up: 'text-emerald-600',
  down: 'text-red-500',
  neutral: 'text-slate-500',
};

export default function MetricCard({
  icon: Icon,
  label,
  value,
  unit = '',
  trend = 'neutral',
  trendValue,
  color = 'text-blue-600',
}) {
  const TrendIcon = trendIcon[trend] || ArrowRight;

  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-athletic">
      <div className="flex items-start justify-between gap-4">
        <div className={`rounded-2xl bg-slate-50 p-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`inline-flex items-center gap-1 text-xs font-semibold ${trendColor[trend]}`}>
          <TrendIcon className="h-4 w-4" />
          <span>{trendValue || 'Stable'}</span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-mono text-3xl font-semibold text-slate-950">{value}</span>
          {unit ? <span className="pb-1 text-sm text-slate-500">{unit}</span> : null}
        </div>
      </div>
    </div>
  );
}

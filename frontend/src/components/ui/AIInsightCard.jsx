import { Lightbulb, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

import RiskBadge from './RiskBadge';

const iconMap = {
  fatigue: TrendingUp,
  recovery: Sparkles,
  injury: ShieldAlert,
  recommendation: Lightbulb,
};

const accentMap = {
  fatigue: 'border-blue-400',
  recovery: 'border-emerald-400',
  injury: 'border-red-400',
  recommendation: 'border-cyan-400',
};

export default function AIInsightCard({ type, value, label, description }) {
  const Icon = iconMap[type] || Lightbulb;
  const accent = accentMap[type] || 'border-blue-400';

  return (
    <div className={`rounded-3xl border-l-4 ${accent} border border-slate-200 bg-white p-5 text-slate-900`}>
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl bg-blue-50 p-3">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        {type === 'recommendation' ? null : <RiskBadge level={value} />}
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
        <p className="mt-3 text-lg font-semibold text-slate-900">
          {type === 'recommendation' ? value : description}
        </p>
        {type === 'recommendation' ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { RefreshCcw, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getTodayPrediction } from '../../api/prediction';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import RiskBadge from '../../components/ui/RiskBadge';

function ProgressRing({ value = 0 }) {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg className="h-48 w-48 -rotate-90" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} stroke="rgba(148,163,184,0.2)" strokeWidth="16" fill="none" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="#2563EB"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-5xl tracking-tight text-slate-900">{value}</div>
        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Recovery Score</div>
      </div>
    </div>
  );
}

function bulletize(text) {
  if (!text) {
    return ['Add more workout and health data to unlock personalized coaching.'];
  }

  return text
    .split(/[.!?]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function fatigueTips(status) {
  const normalized = status?.toLowerCase() || 'normal';

  if (normalized === 'fresh') {
    return ['You are well recovered for a higher-quality session.', 'Keep hydration and sleep steady.'];
  }

  if (normalized === 'fatigued' || normalized === 'overtrained') {
    return ['Reduce intensity today.', 'Favor mobility, technique work, or active recovery.'];
  }

  return ['Stay productive but controlled.', 'Choose quality movement and monitor soreness after the session.'];
}

function recommendationExercises(recommendation = '') {
  const normalized = recommendation.toLowerCase();

  if (normalized.includes('rest')) {
    return ['Mobility flow', 'Easy walk or bike', 'Breathing reset'];
  }

  if (normalized.includes('running') || normalized.includes('endurance')) {
    return ['Tempo intervals', 'Zone 2 cooldown', 'Hip mobility'];
  }

  return ['Compound lift focus', 'Explosive accessory work', 'Cooldown mobility'];
}

export default function AICoach() {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPrediction = async (refreshOnly = false) => {
    try {
      if (refreshOnly) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await getTodayPrediction();
      setPrediction(response.data?.data ?? null);
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to generate today\'s report.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrediction();
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Generating your AI coach report..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 text-slate-900 shadow-athletic sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">AI Coach</p>
        <h2 className="mt-3 font-body text-3xl font-semibold tracking-tight text-slate-950">Your personalized daily performance report</h2>

        <div className="mt-8 grid gap-8 xl:grid-cols-[0.85fr_1.15fr] xl:items-center">
          <div className="flex justify-center">
            <ProgressRing value={prediction?.recovery_score ?? 0} />
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-3">
              <RiskBadge level={prediction?.fatigue_status || 'Normal'} />
              <RiskBadge level={prediction?.injury_risk || 'Low'} />
            </div>
            <p className="text-lg leading-8 text-slate-600">
              {prediction?.recommendation_reason ||
                'Log workouts and health signals consistently to unlock more specific guidance.'}
            </p>
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Today&apos;s recommendation</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {prediction?.recommendation || 'No recommendation yet'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                Fatigue Analysis
              </p>
              <h3 className="font-body text-[1.75rem] font-semibold tracking-tight text-slate-950">Status & tips</h3>
            </div>
          </div>
          <div className="mt-6">
            <RiskBadge level={prediction?.fatigue_status || 'Normal'} />
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Fatigue is estimated from sleep, soreness, energy, resting heart rate, and recent training stress.
            </p>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              {fatigueTips(prediction?.fatigue_status).map((tip) => (
                <div key={tip} className="rounded-2xl bg-slate-50 px-4 py-3">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                Recovery Score
              </p>
              <h3 className="font-body text-[1.75rem] font-semibold tracking-tight text-slate-950">What&apos;s driving it</h3>
            </div>
          </div>
          <p className="mt-6 font-display text-5xl tracking-tight text-slate-950">{prediction?.recovery_score ?? 0}</p>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            {bulletize(prediction?.recovery_advice).map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-50 p-3 text-red-500">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                Injury Risk
              </p>
              <h3 className="font-body text-[1.75rem] font-semibold tracking-tight text-slate-950">Risk factors</h3>
            </div>
          </div>
          <div className="mt-6">
            <RiskBadge level={prediction?.injury_risk || 'Low'} />
          </div>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            {(prediction?.injury_reasons?.length ? prediction.injury_reasons : ['Current data does not show major risk signals.']).map((reason) => (
              <div key={reason} className="rounded-2xl bg-slate-50 px-4 py-3">
                {reason}
              </div>
            ))}
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-700">
              Prevention tip: keep soreness trending down and avoid big spikes in weekly load.
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
                Today&apos;s Workout Recommendation
              </p>
              <h3 className="font-body text-[1.75rem] font-semibold tracking-tight text-slate-950">Suggested session</h3>
            </div>
          </div>
          <p className="mt-6 text-2xl font-semibold text-slate-950">
            {prediction?.recommendation || 'No recommendation yet'}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {prediction?.recommendation_reason || 'The AI coach needs more recent data for a sharper recommendation.'}
          </p>
          <div className="mt-5 space-y-3">
            {recommendationExercises(prediction?.recommendation).map((exercise) => (
              <div key={exercise} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {exercise}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => loadPrediction(true)}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Report'}
        </button>
      </div>
    </motion.div>
  );
}

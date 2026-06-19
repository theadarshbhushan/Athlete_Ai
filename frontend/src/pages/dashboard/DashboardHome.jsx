import { motion } from 'framer-motion';
import {
  Activity,
  Droplets,
  Flame,
  Footprints,
  HeartPulse,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getDashboardSummary } from '../../api/analytics';
import { getHealthHistory } from '../../api/health';
import { getPredictionHistory, getTodayPrediction } from '../../api/prediction';
import { getWorkouts } from '../../api/workout';
import RecoveryChart from '../../components/charts/RecoveryChart';
import TrainingLoadChart from '../../components/charts/TrainingLoadChart';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MetricCard from '../../components/ui/MetricCard';
import RiskBadge from '../../components/ui/RiskBadge';

function toLocalIso(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function startDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toLocalIso(date);
}

function formatShortDate(value) {
  if (!value) return '--';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}

function buildDailyLoad(workouts = []) {
  const start = new Date();
  start.setDate(start.getDate() - 6);

  const byDate = workouts.reduce((accumulator, workout) => {
    const key = workout.date;
    accumulator[key] = (accumulator[key] || 0) + Number(workout.training_load || 0);
    return accumulator;
  }, {});

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = toLocalIso(date);
    return {
      date: key,
      label: formatShortDate(key),
      training_load: Number((byDate[key] || 0).toFixed(1)),
    };
  });
}

function buildRecoveryTrend(history = []) {
  return history
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map((item) => ({
      date: formatShortDate(item.date),
      recovery_score: item.recovery_score ?? 0,
    }));
}

function computeTrend(currentValue, previousValue, unit = '') {
  if (currentValue == null || previousValue == null) {
    return { trend: 'neutral', trendValue: 'No baseline' };
  }

  const delta = Number(currentValue) - Number(previousValue);

  if (delta === 0) {
    return { trend: 'neutral', trendValue: 'Stable' };
  }

  const prefix = delta > 0 ? '+' : '';
  return {
    trend: delta > 0 ? 'up' : 'down',
    trendValue: `${prefix}${delta.toFixed(1)}${unit}`,
  };
}

function ProgressRing({ value = 0 }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <svg className="h-40 w-40 -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} stroke="rgba(148,163,184,0.2)" strokeWidth="14" fill="none" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="#2563EB"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-5xl tracking-tight text-slate-900">{value}</div>
        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Recovery</div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [recoveryTrend, setRecoveryTrend] = useState([]);
  const [trainingLoadTrend, setTrainingLoadTrend] = useState([]);

  const fetchDashboard = async (refreshOnly = false) => {
    try {
      if (refreshOnly) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [summaryResponse, predictionResponse, predictionHistoryResponse, healthResponse, workoutsResponse] =
        await Promise.all([
        getDashboardSummary(),
        getTodayPrediction(),
        getPredictionHistory(),
        getHealthHistory(7),
        getWorkouts({
          start_date: startDateDaysAgo(6),
          end_date: toLocalIso(),
        }),
        ]);

      const nextSummary = summaryResponse.data?.data ?? null;
      const nextPrediction = predictionResponse.data?.data ?? null;
      const nextPredictionHistory = predictionHistoryResponse.data?.data ?? [];
      const nextHealth = healthResponse.data?.data ?? [];
      const nextWorkouts = workoutsResponse.data?.data ?? [];

      setSummary(nextSummary);
      setPrediction(nextPrediction);
      setHealthHistory(nextHealth);
      setRecoveryTrend(buildRecoveryTrend(nextPredictionHistory));
      setTrainingLoadTrend(buildDailyLoad(nextWorkouts));
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);
  const recentHealth = healthHistory.slice().sort((a, b) => a.date.localeCompare(b.date));
  const todayHealth = recentHealth[recentHealth.length - 1] || {};
  const yesterdayHealth = recentHealth[recentHealth.length - 2] || {};

  const recoveryValue = prediction?.recovery_score ?? summary?.recovery_score ?? 0;

  const metrics = [
    {
      icon: Footprints,
      label: 'Steps',
      value: todayHealth.steps ?? summary?.steps ?? '--',
      unit: '',
      color: 'text-blue-600',
      ...computeTrend(todayHealth.steps, yesterdayHealth.steps),
    },
    {
      icon: Sparkles,
      label: 'Sleep',
      value: todayHealth.sleep_hours ?? summary?.sleep_hours ?? '--',
      unit: 'hrs',
      color: 'text-indigo-500',
      ...computeTrend(todayHealth.sleep_hours, yesterdayHealth.sleep_hours, 'h'),
    },
    {
      icon: HeartPulse,
      label: 'Heart Rate',
      value: todayHealth.resting_hr ?? '--',
      unit: 'bpm',
      color: 'text-rose-500',
      ...computeTrend(yesterdayHealth.resting_hr, todayHealth.resting_hr, ' bpm'),
    },
    {
      icon: Flame,
      label: 'Calories',
      value: todayHealth.calories_burned ?? '--',
      unit: 'kcal',
      color: 'text-amber-500',
      ...computeTrend(todayHealth.calories_burned, yesterdayHealth.calories_burned, ' kcal'),
    },
    {
      icon: Activity,
      label: 'Training Load',
      value: summary?.training_load ?? '--',
      unit: '',
      color: 'text-emerald-500',
      ...computeTrend(
        summary?.training_load,
        trainingLoadTrend.slice(0, -1).reduce((sum, item) => sum + item.training_load, 0),
      ),
    },
    {
      icon: Droplets,
      label: 'Hydration',
      value: todayHealth.water_intake_L ?? '--',
      unit: 'L',
      color: 'text-cyan-500',
      ...computeTrend(todayHealth.water_intake_L, yesterdayHealth.water_intake_L, ' L'),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner label="Loading your performance dashboard..." />;
  }

  const renderRecoveryTrend = recoveryTrend.length
    ? recoveryTrend
    : prediction?.date
      ? [{ date: formatShortDate(prediction.date), recovery_score: prediction.recovery_score }]
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 text-slate-900 shadow-athletic sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
              Today&apos;s AI report
            </p>
            <h2 className="mt-3 font-body text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">Performance readiness</h2>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh AI Report'}
          </button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-6">
            <div className="flex flex-col items-center justify-center gap-6 lg:flex-row lg:justify-start">
              <ProgressRing value={recoveryValue} />
              <div className="space-y-4 text-center lg:text-left">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Recovery</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {prediction?.recovery_advice || 'Give your body the inputs it needs to adapt and improve.'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                  <RiskBadge level={prediction?.fatigue_status || summary?.fatigue_status || 'Normal'} />
                  <RiskBadge level={prediction?.injury_risk || summary?.injury_risk || 'Low'} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Fatigue Status</p>
              <div className="mt-4">
                <RiskBadge level={prediction?.fatigue_status || summary?.fatigue_status || 'Normal'} />
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                AI uses sleep, soreness, energy level, and recent load to detect how fresh you look today.
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Injury Risk</p>
              <div className="mt-4">
                <RiskBadge level={prediction?.injury_risk || summary?.injury_risk || 'Low'} />
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {prediction?.injury_reasons?.join(', ') || 'Load and recovery signals are staying in a healthy range.'}
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Recommendation</p>
              <p className="mt-4 text-lg font-semibold text-slate-900">
                {prediction?.recommendation || summary?.recommendation || 'No recommendation yet'}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {prediction?.recommendation_reason ||
                  summary?.recommendation_reason ||
                  'Log health data and workouts to unlock more specific guidance.'}
              </p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Training Load</p>
              <p className="mt-4 font-mono text-4xl font-semibold text-slate-900">
                {summary?.training_load ?? 0}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Weekly load helps the coach understand whether today should push, maintain, or pull back.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Recovery Trend
            </p>
            <h3 className="mt-2 font-body text-[1.75rem] font-semibold tracking-tight text-slate-950">Last 7 days</h3>
          </div>
          <RecoveryChart data={renderRecoveryTrend} />
        </div>

        <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
              Training Load
            </p>
            <h3 className="mt-2 font-body text-[1.75rem] font-semibold tracking-tight text-slate-950">Daily accumulation</h3>
          </div>
          <TrainingLoadChart data={trainingLoadTrend} />
        </div>
      </section>
    </motion.div>
  );
}

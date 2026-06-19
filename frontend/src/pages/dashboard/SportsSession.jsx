import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import {
  getSportsPerformance,
  getSportsSessions,
  logSportsSession,
} from '../../api/sports';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';
import { formatDisplayDate } from '../../utils/date';

function toLocalIso(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

const initialForm = {
  date: toLocalIso(),
  sport: 'badminton',
  duration_min: '',
  intensity: 5,
  result: 'practice',
  sets_won: '',
  notes: '',
};

export default function SportsSession() {
  const [form, setForm] = useState(initialForm);
  const [sessions, setSessions] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [sessionsResponse, performanceResponse] = await Promise.all([
        getSportsSessions(),
        getSportsPerformance(),
      ]);

      setSessions(sessionsResponse.data?.data ?? []);
      setPerformance(performanceResponse.data?.data ?? []);
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to load sports sessions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    const totalSessions = performance.reduce((sum, item) => sum + item.total_sessions, 0);
    const totalDuration = performance.reduce((sum, item) => sum + item.total_duration, 0);
    const totalWins = performance.reduce((sum, item) => sum + item.wins, 0);
    const totalLosses = performance.reduce((sum, item) => sum + item.losses, 0);
    const weightedIntensity = performance.reduce(
      (sum, item) => sum + item.avg_intensity * item.total_sessions,
      0,
    );

    return {
      totalSessions,
      avgDuration: totalSessions ? Math.round(totalDuration / totalSessions) : 0,
      avgIntensity: totalSessions ? (weightedIntensity / totalSessions).toFixed(1) : '0.0',
      winRate: totalWins + totalLosses ? Math.round((totalWins / (totalWins + totalLosses)) * 100) : 0,
    };
  }, [performance]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.date || !form.sport || !form.duration_min) {
      toast.error('Please fill the required session details.');
      return;
    }

    try {
      setIsSubmitting(true);
      await logSportsSession({
        date: form.date,
        sport: form.sport,
        duration_min: Number(form.duration_min),
        intensity: Number(form.intensity),
        result: form.result,
        sets_won: form.sets_won ? Number(form.sets_won) : undefined,
        notes: form.notes || undefined,
      });
      toast.success('Sports session logged.');
      setForm(initialForm);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to log sports session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading sports data..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Sports Sessions</p>
          <h2 className="mt-2 font-body text-3xl font-semibold tracking-tight text-slate-950">Log a sports session</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Sport</span>
            <select
              name="sport"
              value={form.sport}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
            >
              <option value="badminton">Badminton</option>
              <option value="running">Running</option>
              <option value="cycling">Cycling</option>
              <option value="swimming">Swimming</option>
              <option value="football">Football</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Date</span>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Duration (min)</span>
            <input
              type="number"
              name="duration_min"
              value={form.duration_min}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Result</span>
            <select
              name="result"
              value={form.result}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
            >
              <option value="win">Win</option>
              <option value="loss">Loss</option>
              <option value="practice">Practice</option>
            </select>
          </label>

          <label>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>Intensity 1-10</span>
              <span className="font-mono text-blue-600">{form.intensity}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              name="intensity"
              value={form.intensity}
              onChange={handleChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-blue-100 accent-blue-600"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Sets Won</span>
            <input
              type="number"
              name="sets_won"
              value={form.sets_won}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="4"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Logging Session...' : 'Log Session'}
          </button>
        </form>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          eyebrow="Performance Stats"
          title="Total Sessions"
          value={summary.totalSessions}
          description="Logged across all sports."
        />
        <StatCard
          eyebrow="Performance Stats"
          title="Avg Duration"
          value={summary.avgDuration}
          suffix="min"
          description="Average session length."
        />
        <StatCard
          eyebrow="Performance Stats"
          title="Win Rate"
          value={summary.winRate}
          suffix="%"
          description="Only calculated from win/loss results."
        />
        <StatCard
          eyebrow="Performance Stats"
          title="Avg Intensity"
          value={summary.avgIntensity}
          suffix="/10"
          description="Reported effort across sessions."
        />
      </section>

      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Recent Sessions</p>
          <h2 className="mt-2 font-body text-3xl font-semibold tracking-tight text-slate-950">Session history</h2>
        </div>

        {sessions.length ? (
          <div className="dashboard-scroll overflow-x-auto">
            <table className="min-w-[860px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.22em] text-slate-400">
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Sport</th>
                  <th className="pb-4">Duration</th>
                  <th className="pb-4">Intensity</th>
                  <th className="pb-4">Result</th>
                  <th className="pb-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-4 text-sm font-medium text-slate-700">{formatDisplayDate(session.date)}</td>
                    <td className="py-4 text-sm capitalize text-slate-500">{session.sport}</td>
                    <td className="py-4 text-sm text-slate-500">{session.duration_min} min</td>
                    <td className="py-4 text-sm text-slate-500">{session.intensity}/10</td>
                    <td className="py-4 text-sm capitalize text-slate-500">{session.result || 'Practice'}</td>
                    <td className="py-4 text-sm text-slate-500">{session.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
            No sports sessions logged yet. Add one to start tracking performance by sport.
          </div>
        )}
      </section>
    </motion.div>
  );
}

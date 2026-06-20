import { motion } from 'framer-motion';
import {
  Activity,
  Droplets,
  Flame,
  Footprints,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getHeartRateTrend,
  getSleepTrend,
  getTodayMetrics,
  logHealthMetrics,
} from '../../api/health';
import {
  chartGridProps,
  chartMargin,
  getDateXAxisProps,
  getTooltipProps,
  getYAxisProps,
  renderLastPointDot,
} from '../../components/charts/chartTheme';
import SleepChart from '../../components/charts/SleepChart';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MetricCard from '../../components/ui/MetricCard';

function toLocalIso(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

const initialForm = {
  date: toLocalIso(),
  steps: '',
  sleep_hours: '',
  resting_hr: '',
  calories_burned: '',
  water_intake_L: '',
  energy_level: 5,
};

function HeartRateChart({ data = [] }) {
  if (!data.length) {
    return <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">No data yet</div>;
  }

  return (
    <div className="dashboard-scroll overflow-x-auto">
      <div className="min-w-[560px]">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid {...chartGridProps} />
            <XAxis {...getDateXAxisProps('date', data.length)} />
            <YAxis {...getYAxisProps([0, 'auto'])} />
            <Tooltip {...getTooltipProps(' bpm')} />
            <Line
              type="monotone"
              dataKey="resting_hr"
              stroke="#2563EB"
              strokeWidth={3}
              dot={renderLastPointDot(data.length, '#2563EB')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function SmartwatchData() {
  const [form, setForm] = useState(initialForm);
  const [todayMetrics, setTodayMetrics] = useState(null);
  const [sleepTrend, setSleepTrend] = useState([]);
  const [heartRateTrend, setHeartRateTrend] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [todayResponse, sleepResponse, heartResponse] = await Promise.all([
        getTodayMetrics(),
        getSleepTrend(7),
        getHeartRateTrend(7),
      ]);

      setTodayMetrics(todayResponse.data?.data ?? null);
      setSleepTrend((sleepResponse.data?.data ?? []).map((item) => ({ ...item, date: item.date.slice(5) })));
      setHeartRateTrend(
        (heartResponse.data?.data ?? []).map((item) => ({ ...item, date: item.date.slice(5) })),
      );
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to load daily vitals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.date || !form.sleep_hours || !form.resting_hr) {
      toast.error('Please fill in the required health metrics.');
      return;
    }

    try {
      setIsSubmitting(true);
      await logHealthMetrics({
        date: form.date,
        sleep_hours: Number(form.sleep_hours),
        resting_hr: Number(form.resting_hr),
        energy_level: Number(form.energy_level),
        steps: form.steps ? Number(form.steps) : undefined,
        calories_burned: form.calories_burned ? Number(form.calories_burned) : undefined,
        water_intake_L: form.water_intake_L ? Number(form.water_intake_L) : undefined,
      });
      toast.success('Health metrics saved.');
      setForm(initialForm);
      await loadData();
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to save metrics.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading daily vitals..." />;
  }

  const snapshotCards = [
    { icon: Footprints, label: 'Steps', value: todayMetrics?.steps ?? '--', unit: '', color: 'text-blue-600' },
    { icon: Sparkles, label: 'Sleep', value: todayMetrics?.sleep_hours ?? '--', unit: 'hrs', color: 'text-indigo-500' },
    { icon: HeartPulse, label: 'Resting HR', value: todayMetrics?.resting_hr ?? '--', unit: 'bpm', color: 'text-rose-500' },
    { icon: Flame, label: 'Calories', value: todayMetrics?.calories_burned ?? '--', unit: 'kcal', color: 'text-amber-500' },
    { icon: Droplets, label: 'Water Intake', value: todayMetrics?.water_intake_L ?? '--', unit: 'L', color: 'text-cyan-500' },
    { icon: Activity, label: 'Energy Level', value: todayMetrics?.energy_level ?? '--', unit: '/10', color: 'text-emerald-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Daily Vitals
          </p>
          <h2 className="mt-2 font-body text-3xl font-semibold tracking-tight text-slate-950">Log your daily health metrics</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          {[
            ['steps', 'Steps'],
            ['sleep_hours', 'Sleep Hours'],
            ['resting_hr', 'Resting Heart Rate (bpm)'],
            ['calories_burned', 'Calories Burned'],
            ['water_intake_L', 'Water Intake (L)'],
          ].map(([name, label]) => (
            <label key={name}>
              <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
              <input
                type="number"
                step={name === 'sleep_hours' || name === 'water_intake_L' ? '0.1' : '1'}
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
              />
            </label>
          ))}

          <label>
            <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>Energy Level 1-10</span>
              <span className="font-mono text-blue-600">{form.energy_level}</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              name="energy_level"
              value={form.energy_level}
              onChange={handleChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-blue-100 accent-blue-600"
            />
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Saving Metrics...' : 'Save Metrics'}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Today&apos;s Snapshot</p>
          <h2 className="mt-2 font-body text-3xl font-semibold tracking-tight text-slate-950">Current health view</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {snapshotCards.map((metric) => (
            <MetricCard key={metric.label} {...metric} trend="neutral" trendValue="Today" />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Sleep Trend</p>
            <h3 className="mt-2 font-body text-[1.75rem] font-semibold tracking-tight text-slate-950">Last 7 days</h3>
          </div>
          <SleepChart data={sleepTrend} />
        </div>

        <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Heart Rate Trend</p>
            <h3 className="mt-2 font-body text-[1.75rem] font-semibold tracking-tight text-slate-950">Resting heart rate</h3>
          </div>
          <HeartRateChart data={heartRateTrend} />
        </div>
      </section>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import {
  getBodyfatProgress,
  getCaloriesTrend,
  getPerformanceScore,
  getRecoveryTrend,
  getSleepTrend,
  getStrengthProgress,
  getTrainingLoad,
  getWorkoutConsistency,
} from '../../api/analytics';
import { getHealthHistory } from '../../api/health';
import { getPredictionHistory } from '../../api/prediction';

function formatShortDate(value) {
  if (!value) return '--';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}

function TooltipCard({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="text-sm font-semibold text-slate-900">
            {entry.name}: {entry.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="font-body text-[1.75rem] font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function ChartEmpty() {
  return <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">No data yet</div>;
}

function ChartSkeleton() {
  return <div className="h-[300px] animate-pulse rounded-[24px] bg-slate-100" />;
}

function ChartWrap({ children, minWidth = 640 }) {
  return (
    <div className="dashboard-scroll overflow-x-auto">
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}

function strengthToSeries(data = []) {
  const map = new Map();
  const keys = [];

  data.forEach((exerciseEntry) => {
    keys.push(exerciseEntry.exercise);
    exerciseEntry.history.forEach((item) => {
      if (!map.has(item.date)) {
        map.set(item.date, { date: formatShortDate(item.date) });
      }

      map.get(item.date)[exerciseEntry.exercise] = item.max_weight;
    });
  });

  return {
    series: Array.from(map.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, value]) => value),
    keys: keys.slice(0, 4),
  };
}

function riskToValue(label = 'Low') {
  const normalized = label.toLowerCase();

  if (normalized === 'high') return 80;
  if (normalized === 'medium' || normalized === 'normal') return 55;
  if (normalized === 'fatigued') return 72;
  if (normalized === 'overtrained') return 92;
  return 25;
}

export default function Analytics() {
  const [range, setRange] = useState(30);
  const [datasets, setDatasets] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const weeks = range === 7 ? 4 : range === 30 ? 8 : 12;

        const [
          trainingLoadResponse,
          recoveryResponse,
          sleepResponse,
          consistencyResponse,
          strengthResponse,
          caloriesResponse,
          bodyfatResponse,
          performanceResponse,
          predictionResponse,
          healthResponse,
        ] = await Promise.all([
          getTrainingLoad(weeks),
          getRecoveryTrend(range),
          getSleepTrend(range),
          getWorkoutConsistency(weeks),
          getStrengthProgress(),
          getCaloriesTrend(range),
          getBodyfatProgress(),
          getPerformanceScore(range),
          getPredictionHistory(),
          getHealthHistory(range),
        ]);

        setDatasets({
          trainingLoad: (trainingLoadResponse.data?.data ?? []).map((item) => ({
            ...item,
            week: formatShortDate(item.week_start),
          })),
          recoveryTrend: (recoveryResponse.data?.data ?? []).map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
          sleepTrend: (sleepResponse.data?.data ?? []).map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
          workoutConsistency: (consistencyResponse.data?.data ?? []).map((item) => ({
            ...item,
            week: formatShortDate(item.week_start),
          })),
          strengthProgress: strengthResponse.data?.data ?? [],
          caloriesTrend: (caloriesResponse.data?.data ?? []).map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
          bodyfatProgress: (bodyfatResponse.data?.data ?? []).map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
          performanceScore: (performanceResponse.data?.data ?? []).map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
          injuryRiskTimeline: (predictionResponse.data?.data ?? [])
            .slice()
            .reverse()
            .slice(-range)
            .map((item) => ({
              date: formatShortDate(item.date),
              risk_label: item.injury_risk,
              risk_value: riskToValue(item.injury_risk),
            })),
          heartRateTrend: (healthResponse.data?.data ?? []).map((item) => ({
            date: formatShortDate(item.date),
            resting_hr: item.resting_hr,
          })),
        });
      } catch (error) {
        toast.error(error?.response?.data?.detail?.message || 'Unable to load analytics.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [range]);

  const strengthChart = useMemo(
    () => strengthToSeries(datasets?.strengthProgress ?? []),
    [datasets?.strengthProgress],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <section className="flex flex-col gap-4 rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Performance Analytics</p>
          <h2 className="mt-2 font-body text-3xl font-semibold tracking-tight text-slate-950">Multi-signal trend view</h2>
        </div>

        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
          {[7, 30, 90].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                range === value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Last {value} days
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Training Load" subtitle="Weekly load accumulation">
          {isLoading ? (
            <ChartSkeleton />
          ) : datasets?.trainingLoad?.length ? (
            <ChartWrap>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datasets.trainingLoad}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="week" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<TooltipCard />} />
                  <Bar dataKey="training_load" name="Training Load" fill="#2563EB" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard title="Recovery Score Trend" subtitle="Daily readiness pattern">
          {isLoading ? (
            <ChartSkeleton />
          ) : datasets?.recoveryTrend?.length ? (
            <ChartWrap>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datasets.recoveryTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<TooltipCard />} />
                  <Line
                    type="monotone"
                    dataKey="recovery_score"
                    name="Recovery Score"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ fill: '#2563EB', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Sleep Trend" subtitle="Daily sleep hours">
          {isLoading ? (
            <ChartSkeleton />
          ) : datasets?.sleepTrend?.length ? (
            <ChartWrap>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={datasets.sleepTrend}>
                  <defs>
                    <linearGradient id="analyticsSleepFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<TooltipCard />} />
                  <Area type="monotone" dataKey="sleep_hours" name="Sleep Hours" stroke="#60A5FA" fill="url(#analyticsSleepFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard title="Workout Consistency" subtitle="Training days by week">
          {isLoading ? (
            <ChartSkeleton />
          ) : datasets?.workoutConsistency?.length ? (
            <ChartWrap>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datasets.workoutConsistency}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="week" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<TooltipCard />} />
                  <Bar dataKey="days_trained" name="Days Trained" fill="#93C5FD" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Strength Progress" subtitle="Estimated best weight by exercise">
          {isLoading ? (
            <ChartSkeleton />
          ) : strengthChart.series.length && strengthChart.keys.length ? (
            <ChartWrap minWidth={760}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={strengthChart.series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<TooltipCard />} />
                  <Legend />
                  {strengthChart.keys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={key}
                      stroke={['#2563EB', '#60A5FA', '#0EA5E9', '#93C5FD'][index % 4]}
                      strokeWidth={3}
                      dot={{ r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard title="Calories Burned" subtitle="Daily calorie output">
          {isLoading ? (
            <ChartSkeleton />
          ) : datasets?.caloriesTrend?.length ? (
            <ChartWrap>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={datasets.caloriesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<TooltipCard />} />
                  <Bar dataKey="calories" name="Calories" fill="#2563EB" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Body Fat Progress" subtitle="Estimated composition over time">
          {isLoading ? (
            <ChartSkeleton />
          ) : datasets?.bodyfatProgress?.length ? (
            <ChartWrap>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={datasets.bodyfatProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<TooltipCard />} />
                  <Area type="monotone" dataKey="range_high" name="Range High" stroke="#93C5FD" fill="#DBEAFE" />
                  <Line type="monotone" dataKey="estimate" name="Estimate" stroke="#2563EB" strokeWidth={3} />
                  <Line type="monotone" dataKey="range_low" name="Range Low" stroke="#60A5FA" strokeDasharray="6 6" />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard title="Performance Score" subtitle="Composite daily score">
          {isLoading ? (
            <ChartSkeleton />
          ) : datasets?.performanceScore?.length ? (
            <ChartWrap>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datasets.performanceScore}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<TooltipCard />} />
                  <Line
                    type="monotone"
                    dataKey="performance_score"
                    name="Performance Score"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ fill: '#2563EB', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Injury Risk Timeline" subtitle="Risk zones across recent predictions">
          {isLoading ? (
            <ChartSkeleton />
          ) : datasets?.injuryRiskTimeline?.length ? (
            <ChartWrap>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={datasets.injuryRiskTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" domain={[0, 100]} />
                  <ReferenceArea y1={0} y2={35} fill="#DCFCE7" fillOpacity={0.6} />
                  <ReferenceArea y1={35} y2={65} fill="#FEF3C7" fillOpacity={0.7} />
                  <ReferenceArea y1={65} y2={100} fill="#FEE2E2" fillOpacity={0.7} />
                  <Tooltip content={<TooltipCard />} />
                  <Area
                    type="monotone"
                    dataKey="risk_value"
                    name="Risk Level"
                    stroke="#2563EB"
                    fill="#DBEAFE"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>

        <ChartCard title="Heart Rate Trend" subtitle="Resting heart rate over time">
          {isLoading ? (
            <ChartSkeleton />
          ) : datasets?.heartRateTrend?.length ? (
            <ChartWrap>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datasets.heartRateTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip content={<TooltipCard />} />
                  <Line
                    type="monotone"
                    dataKey="resting_hr"
                    name="Resting HR"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ fill: '#2563EB', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrap>
          ) : (
            <ChartEmpty />
          )}
        </ChartCard>
      </section>
    </motion.div>
  );
}

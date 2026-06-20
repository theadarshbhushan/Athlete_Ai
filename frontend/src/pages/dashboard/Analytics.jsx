import { motion } from 'framer-motion';
import { BarChart2, Maximize2, X } from 'lucide-react';
import { cloneElement, isValidElement, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
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
  ResponsiveContainer,
  Tooltip,
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
import { getWorkouts } from '../../api/workout';
import {
  chartGridProps,
  chartMargin,
  formatChartNumber,
  getDateXAxisProps,
  getTooltipProps,
  getXAxisProps,
  getYAxisProps,
  renderLastPointDot,
} from '../../components/charts/chartTheme';

function formatShortDate(value) {
  if (!value) return '--';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}

function createEmptyDatasets() {
  return {
    trainingLoad: [],
    recoveryTrend: [],
    sleepTrend: [],
    workoutConsistency: [],
    strengthProgress: [],
    caloriesTrend: [],
    bodyfatProgress: [],
    performanceScore: [],
    injuryRiskTimeline: [],
    heartRateTrend: [],
  };
}

function calculateSummaryStats(data = [], valueKeys = []) {
  const values = data.flatMap((item) =>
    valueKeys
      .map((key) => Number(item?.[key]))
      .filter((value) => Number.isFinite(value)),
  );

  if (!values.length) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    average: total / values.length,
    count: data.length,
  };
}

function ChartSummaryBar({ stats }) {
  if (!stats) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-4 text-sm text-slate-500">
      <span>Min {formatChartNumber(stats.min)}</span>
      <span>Max {formatChartNumber(stats.max)}</span>
      <span>Average {formatChartNumber(stats.average)}</span>
      <span>{stats.count} data points</span>
    </div>
  );
}

function ChartModal({ title, subtitle, stats, onClose, children }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-full items-center justify-center p-4">
        <div
          className="flex h-[80vh] w-[90vw] max-w-5xl flex-col rounded-2xl bg-white p-8 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-100 p-2 text-slate-600 transition-colors duration-200 hover:bg-slate-200"
              aria-label={`Close ${title} chart`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 min-h-0 flex-1">{children}</div>
          <ChartSummaryBar stats={stats} />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, stats, canExpand, renderChart }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="group rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-body text-[1.75rem] font-semibold tracking-tight text-slate-950">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          </div>

          {canExpand ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 opacity-0 transition-all duration-200 hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 focus-visible:opacity-100"
              aria-label={`Expand ${title} chart`}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          ) : (
            <div className="h-9 w-9" />
          )}
        </div>

        {renderChart({ expanded: false, height: 300 })}
      </div>

      {expanded ? (
        <ChartModal title={title} subtitle={subtitle} stats={stats} onClose={() => setExpanded(false)}>
          {renderChart({ expanded: true, height: 450 })}
        </ChartModal>
      ) : null}
    </>
  );
}

function ChartEmpty({
  height = 300,
  onAction,
  title = 'No data yet',
  subtitle = 'Log your workouts to see trends',
  actionLabel = 'Log Now',
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[24px] bg-slate-50 px-6 text-center"
      style={{ height }}
    >
      <BarChart2 className="h-10 w-10 text-slate-300" />
      <p className="mt-4 text-base font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
      >
        {actionLabel}
      </button>
    </div>
  );
}

function ChartSkeleton({ height = 300 }) {
  return <div className="animate-pulse rounded-[24px] bg-slate-100" style={{ height }} />;
}

function ChartWrap({ children, dataLength = 0, scrollable = false, minWidth }) {
  const enableScroll = scrollable && dataLength > 10;
  const computedWidth = enableScroll ? Math.max(500, Math.max(dataLength, 1) * 40) : null;
  const wrappedChild =
    enableScroll && isValidElement(children)
      ? cloneElement(children, { width: computedWidth })
      : children;

  return (
    <div className="h-full">
      <div className={enableScroll ? 'dashboard-scroll overflow-x-auto pb-2' : ''}>
        <div style={enableScroll ? { width: computedWidth } : minWidth ? { minWidth } : { width: '100%' }}>
          {wrappedChild}
        </div>
      </div>
      {enableScroll ? (
        <p className="mt-3 text-center text-xs text-slate-400">{'<- Scroll to see more ->'}</p>
      ) : null}
    </div>
  );
}

function strengthToSeries(data = []) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { series: [], keys: [] };
  }

  const map = new Map();
  const keys = [];

  (data || []).forEach((exerciseEntry) => {
    if (!exerciseEntry) {
      return;
    }

    const exerciseName = exerciseEntry.exercise || exerciseEntry.name;
    const exerciseData = exerciseEntry.history || exerciseEntry.data;

    if (!exerciseName || !Array.isArray(exerciseData)) {
      return;
    }

    keys.push(exerciseName);

    exerciseData.forEach((item) => {
      if (!item || !item.date) {
        return;
      }

      if (!map.has(item.date)) {
        map.set(item.date, { date: formatShortDate(item.date) });
      }

      const currentRow = map.get(item.date);
      currentRow[exerciseName] = item.max_weight ?? item.weight ?? 0;
    });
  });

  return {
    series: Array.from(map.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, value]) => value),
    keys: keys.slice(0, 4),
  };
}

function processStrengthData(workouts = []) {
  const exerciseMap = {};

  (workouts || []).forEach((workout) => {
    if (workout.type === 'gym' && workout.exercise && workout.weight_kg) {
      if (!exerciseMap[workout.exercise]) {
        exerciseMap[workout.exercise] = [];
      }

      exerciseMap[workout.exercise].push({
        date: workout.date,
        max_weight: workout.weight_kg,
      });
    }
  });

  return Object.entries(exerciseMap).map(([exercise, history]) => ({
    exercise,
    history: history
      .sort((left, right) => left.date.localeCompare(right.date))
      .map((item) => ({
        date: item.date,
        max_weight: item.max_weight,
      })),
  }));
}

function riskToValue(label = 'Low') {
  const normalized = label.toLowerCase();

  if (normalized === 'high') return 80;
  if (normalized === 'medium' || normalized === 'normal') return 55;
  if (normalized === 'fatigued') return 72;
  if (normalized === 'overtrained') return 92;
  return 25;
}

function hasEnoughPoints(data = []) {
  return data.length > 1;
}

export default function Analytics() {
  const navigate = useNavigate();
  const [range, setRange] = useState(30);
  const [datasets, setDatasets] = useState(createEmptyDatasets);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const safeRequest = async (request, fallback = []) => {
        try {
          const response = await request();
          return response?.data?.data || fallback;
        } catch (error) {
          return fallback;
        }
      };

      try {
        setIsLoading(true);
        const weeks = range === 7 ? 4 : range === 30 ? 8 : 12;

        const [
          trainingLoadData,
          recoveryData,
          sleepData,
          consistencyData,
          strengthData,
          caloriesData,
          bodyfatData,
          performanceData,
          predictionData,
          healthData,
        ] = await Promise.all([
          safeRequest(() => getTrainingLoad(weeks)),
          safeRequest(() => getRecoveryTrend(range)),
          safeRequest(() => getSleepTrend(range)),
          safeRequest(() => getWorkoutConsistency(weeks)),
          safeRequest(() => getStrengthProgress()),
          safeRequest(() => getCaloriesTrend(range)),
          safeRequest(() => getBodyfatProgress()),
          safeRequest(() => getPerformanceScore(range)),
          safeRequest(() => getPredictionHistory()),
          safeRequest(() => getHealthHistory(range)),
        ]);

        let strengthProgress = Array.isArray(strengthData) ? strengthData : [];

        if (!strengthProgress.length) {
          const workoutsData = await safeRequest(() => getWorkouts());
          strengthProgress = processStrengthData(workoutsData);
        }

        setDatasets({
          trainingLoad: (trainingLoadData || []).map((item) => ({
            ...item,
            week: formatShortDate(item.week_start),
          })),
          recoveryTrend: (recoveryData || []).map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
          sleepTrend: (sleepData || []).map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
          workoutConsistency: (consistencyData || []).map((item) => ({
            ...item,
            week: formatShortDate(item.week_start),
          })),
          strengthProgress,
          caloriesTrend: (caloriesData || []).map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
          bodyfatProgress: (bodyfatData || []).map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
          performanceScore: (performanceData || []).map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
          injuryRiskTimeline: (predictionData || [])
            .slice()
            .reverse()
            .slice(-range)
            .map((item) => ({
              date: formatShortDate(item.date),
              risk_label: item.injury_risk,
              risk_value: riskToValue(item.injury_risk),
            })),
          heartRateTrend: (healthData || []).map((item) => ({
            date: formatShortDate(item.date),
            resting_hr: item.resting_hr,
          })),
        });
      } catch (error) {
        toast.error(error?.response?.data?.detail?.message || 'Unable to load analytics.');
        setDatasets(createEmptyDatasets());
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

  const strengthStats = useMemo(
    () => calculateSummaryStats(strengthChart.series, strengthChart.keys),
    [strengthChart.keys, strengthChart.series],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {datasets && strengthChart && (
        <>
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
                    range === value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-blue-600'
                  }`}
                >
                  Last {value} days
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Training Load"
          subtitle="Weekly load accumulation"
          stats={calculateSummaryStats(datasets?.trainingLoad ?? [], ['training_load'])}
          canExpand={!isLoading && hasEnoughPoints(datasets?.trainingLoad ?? [])}
          renderChart={({ height }) =>
            isLoading ? (
              <ChartSkeleton height={height} />
            ) : hasEnoughPoints(datasets?.trainingLoad ?? []) ? (
              <ChartWrap dataLength={datasets.trainingLoad.length} scrollable>
                <ResponsiveContainer width="100%" height={height}>
                  <BarChart data={datasets.trainingLoad} margin={chartMargin}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis {...getXAxisProps('week')} />
                    <YAxis {...getYAxisProps([0, 'auto'])} />
                    <Tooltip {...getTooltipProps()} />
                    <Bar dataKey="training_load" name="Training Load" fill="#2563EB" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrap>
            ) : (
              <ChartEmpty height={height} onAction={() => navigate('/dashboard/workout')} />
            )
          }
        />

        <ChartCard
          title="Recovery Score Trend"
          subtitle="Daily readiness pattern"
          stats={calculateSummaryStats(datasets?.recoveryTrend ?? [], ['recovery_score'])}
          canExpand={!isLoading && hasEnoughPoints(datasets?.recoveryTrend ?? [])}
          renderChart={({ height }) =>
            isLoading ? (
              <ChartSkeleton height={height} />
            ) : hasEnoughPoints(datasets?.recoveryTrend ?? []) ? (
              <ChartWrap dataLength={datasets.recoveryTrend.length} scrollable>
                <ResponsiveContainer width="100%" height={height}>
                  <LineChart data={datasets.recoveryTrend} margin={chartMargin}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis {...getDateXAxisProps('date', datasets.recoveryTrend.length)} />
                    <YAxis {...getYAxisProps([0, 'auto'])} />
                    <Tooltip {...getTooltipProps()} />
                    <Line
                      type="monotone"
                      dataKey="recovery_score"
                      name="Recovery Score"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={renderLastPointDot(datasets.recoveryTrend.length, '#2563EB')}
                      activeDot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrap>
            ) : (
              <ChartEmpty height={height} onAction={() => navigate('/dashboard/smartwatch')} />
            )
          }
        />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Sleep Trend"
          subtitle="Daily sleep hours"
          stats={calculateSummaryStats(datasets?.sleepTrend ?? [], ['sleep_hours'])}
          canExpand={!isLoading && hasEnoughPoints(datasets?.sleepTrend ?? [])}
          renderChart={({ expanded, height }) =>
            isLoading ? (
              <ChartSkeleton height={height} />
            ) : hasEnoughPoints(datasets?.sleepTrend ?? []) ? (
              <ChartWrap dataLength={datasets.sleepTrend.length} scrollable>
                <ResponsiveContainer width="100%" height={height}>
                  <AreaChart data={datasets.sleepTrend} margin={chartMargin}>
                    <defs>
                      <linearGradient
                        id={expanded ? 'analyticsSleepFillExpanded' : 'analyticsSleepFill'}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis {...getDateXAxisProps('date', datasets.sleepTrend.length)} />
                    <YAxis {...getYAxisProps([0, 'auto'])} />
                    <Tooltip {...getTooltipProps(' hrs')} />
                    <Area
                      type="monotone"
                      dataKey="sleep_hours"
                      name="Sleep Hours"
                      stroke="#60A5FA"
                      fill={`url(#${expanded ? 'analyticsSleepFillExpanded' : 'analyticsSleepFill'})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartWrap>
            ) : (
              <ChartEmpty height={height} onAction={() => navigate('/dashboard/smartwatch')} />
            )
          }
        />

        <ChartCard
          title="Workout Consistency"
          subtitle="Training days by week"
          stats={calculateSummaryStats(datasets?.workoutConsistency ?? [], ['days_trained'])}
          canExpand={!isLoading && hasEnoughPoints(datasets?.workoutConsistency ?? [])}
          renderChart={({ height }) =>
            isLoading ? (
              <ChartSkeleton height={height} />
            ) : hasEnoughPoints(datasets?.workoutConsistency ?? []) ? (
              <ChartWrap>
                <ResponsiveContainer width="100%" height={height}>
                  <BarChart data={datasets.workoutConsistency} margin={chartMargin}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis {...getXAxisProps('week')} />
                    <YAxis {...getYAxisProps([0, 'auto'])} />
                    <Tooltip {...getTooltipProps()} />
                    <Bar dataKey="days_trained" name="Days Trained" fill="#93C5FD" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrap>
            ) : (
              <ChartEmpty height={height} onAction={() => navigate('/dashboard/workout')} />
            )
          }
        />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Strength Progress"
          subtitle="Estimated best weight by exercise"
          stats={strengthStats}
          canExpand={!isLoading && Boolean(strengthChart.series.length && strengthChart.keys.length)}
          renderChart={({ height }) =>
            isLoading ? (
              <ChartSkeleton height={height} />
            ) : strengthChart.series.length && strengthChart.keys.length ? (
              <div className="h-full">
                <ResponsiveContainer width="100%" height={height}>
                  <LineChart data={strengthChart.series} margin={chartMargin}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis {...getDateXAxisProps('date', strengthChart.series.length)} />
                    <YAxis {...getYAxisProps([0, 'auto'])} />
                    <Tooltip {...getTooltipProps(' kg')} />
                    <Legend />
                    {strengthChart.keys.map((key, index) => {
                      const stroke = ['#2563EB', '#60A5FA', '#0EA5E9', '#93C5FD'][index % 4];
                      return (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          name={key}
                          stroke={stroke}
                          strokeWidth={3}
                          dot={renderLastPointDot(strengthChart.series.length, stroke, 3)}
                          activeDot={{ r: 5, fill: stroke, stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartEmpty
                height={height}
                onAction={() => navigate('/dashboard/workout')}
                subtitle="Log gym workouts with weight to see strength progress"
              />
            )
          }
        />

        <ChartCard
          title="Calories Burned"
          subtitle="Daily calorie output"
          stats={calculateSummaryStats(datasets?.caloriesTrend ?? [], ['calories'])}
          canExpand={!isLoading && hasEnoughPoints(datasets?.caloriesTrend ?? [])}
          renderChart={({ height }) =>
            isLoading ? (
              <ChartSkeleton height={height} />
            ) : hasEnoughPoints(datasets?.caloriesTrend ?? []) ? (
              <ChartWrap dataLength={datasets.caloriesTrend.length} scrollable>
                <ResponsiveContainer width="100%" height={height}>
                  <BarChart data={datasets.caloriesTrend} margin={chartMargin}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis {...getDateXAxisProps('date', datasets.caloriesTrend.length)} />
                    <YAxis {...getYAxisProps([0, 'auto'])} />
                    <Tooltip {...getTooltipProps()} />
                    <Bar dataKey="calories" name="Calories" fill="#2563EB" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartWrap>
            ) : (
              <ChartEmpty height={height} onAction={() => navigate('/dashboard/smartwatch')} />
            )
          }
        />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Body Fat Progress"
          subtitle="Estimated composition over time"
          stats={calculateSummaryStats(datasets?.bodyfatProgress ?? [], ['estimate'])}
          canExpand={!isLoading && hasEnoughPoints(datasets?.bodyfatProgress ?? [])}
          renderChart={({ height }) =>
            isLoading ? (
              <ChartSkeleton height={height} />
            ) : hasEnoughPoints(datasets?.bodyfatProgress ?? []) ? (
              <ChartWrap dataLength={datasets.bodyfatProgress.length} scrollable>
                <ResponsiveContainer width="100%" height={height}>
                  <ComposedChart data={datasets.bodyfatProgress} margin={chartMargin}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis {...getDateXAxisProps('date', datasets.bodyfatProgress.length)} />
                    <YAxis {...getYAxisProps([0, 'auto'])} />
                    <Tooltip {...getTooltipProps('%')} />
                    <Area type="monotone" dataKey="range_high" name="Range High" stroke="#93C5FD" fill="#DBEAFE" />
                    <Line
                      type="monotone"
                      dataKey="estimate"
                      name="Estimate"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={renderLastPointDot(datasets.bodyfatProgress.length, '#2563EB')}
                      activeDot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="range_low"
                      name="Range Low"
                      stroke="#60A5FA"
                      strokeDasharray="6 6"
                      dot={renderLastPointDot(datasets.bodyfatProgress.length, '#60A5FA')}
                      activeDot={{ r: 5, fill: '#60A5FA', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartWrap>
            ) : (
              <ChartEmpty height={height} onAction={() => navigate('/dashboard/bodyfat')} />
            )
          }
        />

        <ChartCard
          title="Performance Score"
          subtitle="Composite daily score"
          stats={calculateSummaryStats(datasets?.performanceScore ?? [], ['performance_score'])}
          canExpand={!isLoading && hasEnoughPoints(datasets?.performanceScore ?? [])}
          renderChart={({ height }) =>
            isLoading ? (
              <ChartSkeleton height={height} />
            ) : hasEnoughPoints(datasets?.performanceScore ?? []) ? (
              <ChartWrap dataLength={datasets.performanceScore.length} scrollable>
                <ResponsiveContainer width="100%" height={height}>
                  <LineChart data={datasets.performanceScore} margin={chartMargin}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis {...getDateXAxisProps('date', datasets.performanceScore.length)} />
                    <YAxis {...getYAxisProps([0, 'auto'])} />
                    <Tooltip {...getTooltipProps()} />
                    <Line
                      type="monotone"
                      dataKey="performance_score"
                      name="Performance Score"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={renderLastPointDot(datasets.performanceScore.length, '#2563EB')}
                      activeDot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrap>
            ) : (
              <ChartEmpty height={height} onAction={() => navigate('/dashboard/workout')} />
            )
          }
        />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Injury Risk Timeline"
          subtitle="Risk zones across recent predictions"
          stats={calculateSummaryStats(datasets?.injuryRiskTimeline ?? [], ['risk_value'])}
          canExpand={!isLoading && hasEnoughPoints(datasets?.injuryRiskTimeline ?? [])}
          renderChart={({ height }) =>
            isLoading ? (
              <ChartSkeleton height={height} />
            ) : hasEnoughPoints(datasets?.injuryRiskTimeline ?? []) ? (
              <ChartWrap dataLength={datasets.injuryRiskTimeline.length} scrollable>
                <ResponsiveContainer width="100%" height={height}>
                  <AreaChart data={datasets.injuryRiskTimeline} margin={chartMargin}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis {...getDateXAxisProps('date', datasets.injuryRiskTimeline.length)} />
                    <YAxis {...getYAxisProps([0, 'auto'])} />
                    <ReferenceArea y1={0} y2={35} fill="#DCFCE7" fillOpacity={0.6} />
                    <ReferenceArea y1={35} y2={65} fill="#FEF3C7" fillOpacity={0.7} />
                    <ReferenceArea y1={65} y2={100} fill="#FEE2E2" fillOpacity={0.7} />
                    <Tooltip {...getTooltipProps()} />
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
              <ChartEmpty height={height} onAction={() => navigate('/dashboard/workout')} />
            )
          }
        />

        <ChartCard
          title="Heart Rate Trend"
          subtitle="Resting heart rate over time"
          stats={calculateSummaryStats(datasets?.heartRateTrend ?? [], ['resting_hr'])}
          canExpand={!isLoading && hasEnoughPoints(datasets?.heartRateTrend ?? [])}
          renderChart={({ height }) =>
            isLoading ? (
              <ChartSkeleton height={height} />
            ) : hasEnoughPoints(datasets?.heartRateTrend ?? []) ? (
              <ChartWrap dataLength={datasets.heartRateTrend.length} scrollable>
                <ResponsiveContainer width="100%" height={height}>
                  <LineChart data={datasets.heartRateTrend} margin={chartMargin}>
                    <CartesianGrid {...chartGridProps} />
                    <XAxis {...getDateXAxisProps('date', datasets.heartRateTrend.length)} />
                    <YAxis {...getYAxisProps([0, 'auto'])} />
                    <Tooltip {...getTooltipProps(' bpm')} />
                    <Line
                      type="monotone"
                      dataKey="resting_hr"
                      name="Resting HR"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={renderLastPointDot(datasets.heartRateTrend.length, '#2563EB')}
                      activeDot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartWrap>
            ) : (
              <ChartEmpty height={height} onAction={() => navigate('/dashboard/smartwatch')} />
            )
          }
        />
          </section>
        </>
      )}
    </motion.div>
  );
}

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  chartGridProps,
  chartMargin,
  getDateXAxisProps,
  getTooltipProps,
  getYAxisProps,
} from './chartTheme';

export default function SleepChart({ data = [] }) {
  if (!data.length) {
    return <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">No data yet</div>;
  }

  return (
    <div className="dashboard-scroll overflow-x-auto">
      <div className="min-w-[560px]">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={chartMargin}>
            <defs>
              <linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartGridProps} />
            <XAxis {...getDateXAxisProps('date', data.length)} />
            <YAxis {...getYAxisProps([0, 'auto'])} />
            <Tooltip {...getTooltipProps(' hrs')} />
            <Area
              type="monotone"
              dataKey="sleep_hours"
              stroke="#60A5FA"
              fill="url(#sleepFill)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

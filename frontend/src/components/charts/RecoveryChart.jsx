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
  chartGridProps,
  chartMargin,
  getDateXAxisProps,
  getTooltipProps,
  getYAxisProps,
  renderLastPointDot,
} from './chartTheme';

export default function RecoveryChart({ data = [] }) {
  if (!data.length) {
    return <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">No data yet</div>;
  }

  return (
    <div className="dashboard-scroll overflow-x-auto">
      <div className="min-w-[640px]">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid {...chartGridProps} />
            <XAxis {...getDateXAxisProps('date', data.length)} />
            <YAxis {...getYAxisProps([0, 'auto'])} />
            <Tooltip {...getTooltipProps()} />
            <Line
              type="monotone"
              dataKey="recovery_score"
              stroke="#2563EB"
              strokeWidth={3}
              dot={renderLastPointDot(data.length, '#2563EB')}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

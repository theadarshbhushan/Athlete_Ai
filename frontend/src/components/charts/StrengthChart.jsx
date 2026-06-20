import {
  CartesianGrid,
  Legend,
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

const colors = ['#2563EB', '#60A5FA', '#0EA5E9', '#93C5FD'];

export default function StrengthChart({ data = [], keys = [] }) {
  if (!data.length || !keys.length) {
    return <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">No data yet</div>;
  }

  return (
    <div className="dashboard-scroll overflow-x-auto">
      <div className="min-w-[720px]">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid {...chartGridProps} />
            <XAxis {...getDateXAxisProps('date', data.length)} />
            <YAxis {...getYAxisProps([0, 'auto'])} />
            <Tooltip {...getTooltipProps(' kg')} />
            <Legend />
            {keys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={colors[index % colors.length]}
                strokeWidth={3}
                dot={renderLastPointDot(data.length, colors[index % colors.length], 3)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

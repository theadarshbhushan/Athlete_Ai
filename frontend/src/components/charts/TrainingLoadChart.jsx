import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  chartGridProps,
  chartMargin,
  getTooltipProps,
  getXAxisProps,
  getYAxisProps,
} from './chartTheme';

export default function TrainingLoadChart({ data = [] }) {
  if (!data.length) {
    return <div className="flex h-[300px] items-center justify-center text-sm text-slate-500">No data yet</div>;
  }

  return (
    <div className="dashboard-scroll overflow-x-auto">
      <div className="min-w-[640px]">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={chartMargin}>
            <CartesianGrid {...chartGridProps} />
            <XAxis {...getXAxisProps('label')} />
            <YAxis {...getYAxisProps([0, 'auto'])} />
            <Tooltip {...getTooltipProps()} />
            <Bar dataKey="training_load" fill="#2563EB" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

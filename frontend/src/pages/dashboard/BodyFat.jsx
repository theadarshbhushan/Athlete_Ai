import { motion } from 'framer-motion';
import { ImagePlus, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  estimateBodyfat,
  getBodyfatHistory,
  uploadBodyfatPhoto,
} from '../../api/bodyfat';
import {
  chartGridProps,
  chartMargin,
  getDateXAxisProps,
  getTooltipProps,
  getYAxisProps,
  renderLastPointDot,
} from '../../components/charts/chartTheme';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import RiskBadge from '../../components/ui/RiskBadge';
import { useAuth } from '../../hooks/useAuth';

function formatShortDate(value) {
  if (!value) return '--';
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(value));
}

function ResultCard({ result }) {
  if (!result) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
        Estimate a result to see your body composition range.
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-slate-900 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Latest Result</p>
      <p className="mt-4 font-display text-5xl tracking-tight text-slate-900">
        {result.range_low}% - {result.range_high}%
      </p>
      <p className="mt-3 text-lg text-slate-600">Estimated body fat: {result.estimate}%</p>
      <div className="mt-5">
        <RiskBadge level={result.confidence || 'Normal'} />
      </div>
    </div>
  );
}

export default function BodyFat() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [tab, setTab] = useState('manual');
  const [manualForm, setManualForm] = useState({
    height_cm: user?.height || '',
    weight_kg: user?.weight || '',
    age: user?.age || '',
    gender: user?.gender || 'male',
    neck_cm: '',
    waist_cm: '',
    hip_cm: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setManualForm((current) => ({
      ...current,
      height_cm: user?.height || current.height_cm,
      weight_kg: user?.weight || current.weight_kg,
      age: user?.age || current.age,
      gender: user?.gender || current.gender,
    }));
  }, [user]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await getBodyfatHistory();
      setHistory(
        (response.data?.data ?? [])
          .slice()
          .reverse()
          .map((item) => ({
            ...item,
            date: formatShortDate(item.date),
          })),
      );
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to load body fat history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleManualChange = (event) => {
    const { name, value } = event.target;
    setManualForm((current) => ({ ...current, [name]: value }));
  };

  const handleManualSubmit = async (event) => {
    event.preventDefault();

    if (!manualForm.height_cm || !manualForm.weight_kg || !manualForm.age || !manualForm.waist_cm) {
      toast.error('Please fill the key measurement fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await estimateBodyfat({
        height_cm: Number(manualForm.height_cm),
        weight_kg: Number(manualForm.weight_kg),
        age: Number(manualForm.age),
        gender: manualForm.gender,
        neck_cm: manualForm.neck_cm ? Number(manualForm.neck_cm) : undefined,
        waist_cm: manualForm.waist_cm ? Number(manualForm.waist_cm) : undefined,
        hip_cm: manualForm.hip_cm ? Number(manualForm.hip_cm) : undefined,
      });
      setResult(response.data?.data ?? null);
      toast.success('Body fat estimate generated.');
      await loadHistory();
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to estimate body fat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please choose a photo first.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await uploadBodyfatPhoto(selectedFile);
      setResult(response.data?.data ?? null);
      toast.success('Photo analyzed successfully.');
      setSelectedFile(null);
      await loadHistory();
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to analyze this photo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goalLine = useMemo(() => {
    if (!user?.goal?.toLowerCase().includes('fat')) {
      return null;
    }

    return user?.gender === 'female' ? 22 : 15;
  }, [user?.goal, user?.gender]);

  if (isLoading) {
    return <LoadingSpinner label="Loading body composition data..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
            {[
              ['manual', 'Manual Measurements'],
              ['photo', 'Photo Upload'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  tab === value ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
              {[
                ['height_cm', 'Height'],
                ['weight_kg', 'Weight'],
                ['age', 'Age'],
                ['neck_cm', 'Neck cm'],
                ['waist_cm', 'Waist cm'],
                ['hip_cm', 'Hip cm'],
              ].map(([name, label]) => (
                <label key={name}>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
                  <input
                    type="number"
                    name={name}
                    value={manualForm[name]}
                    onChange={handleManualChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  />
                </label>
              ))}

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Gender</span>
                <select
                  name="gender"
                  value={manualForm.gender}
                  onChange={handleManualChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="md:col-span-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Estimating...' : 'Estimate Body Fat'}
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex min-h-[240px] w-full flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-blue-200 bg-blue-50/40 px-6 text-center transition-all duration-300 hover:border-blue-600"
              >
                <UploadCloud className="h-10 w-10 text-blue-600" />
                <p className="mt-4 font-semibold text-slate-900">
                  {selectedFile ? selectedFile.name : 'Drag, drop, or choose a photo'}
                </p>
                <p className="mt-2 text-sm text-slate-500">Use a front-facing body photo for the best estimate.</p>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={handlePhotoSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <ImagePlus className="h-4 w-4" />
                {isSubmitting ? 'Analyzing...' : 'Upload & Analyze'}
              </button>
              <p className="text-sm text-slate-500">
                Estimate only. Consult a professional for accuracy.
              </p>
            </div>
          )}
        </div>

        <ResultCard result={result} />
      </section>

      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">History</p>
          <h2 className="mt-2 font-body text-3xl font-semibold tracking-tight text-slate-950">Body fat progress</h2>
        </div>

        {history.length ? (
          <div className="dashboard-scroll overflow-x-auto">
            <div className="min-w-[720px]">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={history} margin={chartMargin}>
                  <CartesianGrid {...chartGridProps} />
                  <XAxis {...getDateXAxisProps('date', history.length)} />
                  <YAxis {...getYAxisProps([0, 'auto'])} />
                  <Tooltip {...getTooltipProps('%')} />
                  <Area type="monotone" dataKey="range_high" stroke="#93C5FD" fill="#DBEAFE" name="Range High" />
                  <Line
                    type="monotone"
                    dataKey="estimate"
                    stroke="#2563EB"
                    strokeWidth={3}
                    name="Estimate"
                    dot={renderLastPointDot(history.length, '#2563EB')}
                  />
                  <Line
                    type="monotone"
                    dataKey="range_low"
                    stroke="#60A5FA"
                    strokeDasharray="6 6"
                    name="Range Low"
                    dot={renderLastPointDot(history.length, '#60A5FA')}
                  />
                  {goalLine ? (
                    <ReferenceLine y={goalLine} stroke="#22C55E" strokeDasharray="6 6" label="Goal" />
                  ) : null}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
            No body fat estimates yet. Add a manual measurement or upload a photo to begin tracking.
          </div>
        )}
      </section>
    </motion.div>
  );
}

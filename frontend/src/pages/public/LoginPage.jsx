import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      toast.error('Please enter your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(form.email, form.password);
    } catch (error) {
      toast.error(
        error?.response?.data?.detail?.message || 'Unable to sign in with those credentials.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1fr_0.9fr]">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="relative hidden overflow-hidden bg-slate-50 px-10 py-12 text-slate-900 lg:flex lg:flex-col lg:justify-between"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.6),_transparent_32%)]" />
          <div className="relative">
            <Link to="/" className="font-display text-4xl uppercase text-blue-600">
              Athlete AI
            </Link>
          </div>

          <div className="relative max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Welcome back</p>
            <h1 className="mt-5 font-display text-6xl leading-[0.92] tracking-tight">
              Welcome back, champion
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Your performance system is ready. Step back into your dashboard and let the AI coach guide the day.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <ShieldCheck className="h-6 w-6 text-emerald-300" />
                <div className="mt-4 text-xl font-semibold">Recovery insights</div>
                <div className="mt-2 text-sm text-slate-600">Live readiness, fatigue, and injury signals.</div>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <div className="mt-4 text-xl font-semibold">Training analytics</div>
                <div className="mt-2 text-sm text-slate-600">Progress snapshots across every training block.</div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="flex items-center justify-center px-6 py-12 sm:px-8"
        >
          <div className="w-full max-w-xl rounded-[36px] border border-slate-100 bg-white p-8 shadow-athletic sm:p-10">
            <div className="lg:hidden">
              <Link to="/" className="font-display text-4xl uppercase text-blue-600">
                Athlete AI
              </Link>
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              Sign in
            </p>
            <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950">Continue your climb</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Access your training logs, readiness report, and performance analytics.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
                {isSubmitting ? null : <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            {isSubmitting ? <LoadingSpinner label="Signing you in..." /> : null}

            <p className="mt-8 text-sm text-slate-500">
              New here?{' '}
              <Link to="/signup" className="font-semibold text-blue-600">
                Create an account
              </Link>
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

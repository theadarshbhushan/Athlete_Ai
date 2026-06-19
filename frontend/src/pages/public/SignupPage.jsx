import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

const initialForm = {
  name: '',
  email: '',
  password: '',
  age: '',
  height: '',
  weight: '',
  gender: 'male',
  sport: 'badminton',
  goal: 'fat loss',
};

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = ['name', 'email', 'password', 'age', 'height', 'weight'];
    const missing = requiredFields.some((field) => !form[field]);

    if (missing) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signup({
        ...form,
        age: Number(form.age),
        height: Number(form.height),
        weight: Number(form.weight),
      });
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to create your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="relative hidden overflow-hidden bg-slate-50 px-10 py-12 text-slate-900 lg:flex lg:flex-col lg:justify-between"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_30%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.6),_transparent_28%)]" />
          <div className="relative">
            <Link to="/" className="font-display text-4xl uppercase text-blue-600">
              Athlete AI
            </Link>
          </div>

          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Join the roster</p>
            <h1 className="mt-5 font-display text-6xl leading-[0.92] tracking-tight">
              Join 10,000+ athletes
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Build a premium training command center around your workouts, recovery data, and daily recommendations.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <div className="mt-4 text-xl font-semibold">Personalized coaching</div>
                <div className="mt-2 text-sm text-slate-600">AI adapts your day using sleep, load, and soreness.</div>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-white p-5">
                <Trophy className="h-6 w-6 text-emerald-300" />
                <div className="mt-4 text-xl font-semibold">Built for serious goals</div>
                <div className="mt-2 text-sm text-slate-600">Performance, endurance, fat loss, or muscle gain.</div>
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
          <div className="w-full max-w-2xl rounded-[36px] border border-slate-100 bg-white p-8 shadow-athletic sm:p-10">
            <div className="lg:hidden">
              <Link to="/" className="font-display text-4xl uppercase text-blue-600">
                Athlete AI
              </Link>
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              Create account
            </p>
            <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950">Start your free setup</h2>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Athlete name' },
                { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
                { label: 'Password', name: 'password', type: 'password', placeholder: 'Minimum 6 characters' },
                { label: 'Age', name: 'age', type: 'number', placeholder: '25' },
                { label: 'Height (cm)', name: 'height', type: 'number', placeholder: '178' },
                { label: 'Weight (kg)', name: 'weight', type: 'number', placeholder: '76' },
              ].map((field) => (
                <label key={field.name} className={field.name === 'password' ? 'sm:col-span-2' : ''}>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</span>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  />
                </label>
              ))}

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-700">Gender</span>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </label>

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
                  <option value="gym">Gym</option>
                  <option value="cycling">Cycling</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Goal</span>
                <select
                  name="goal"
                  value={form.goal}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                >
                  <option value="fat loss">Fat Loss</option>
                  <option value="muscle gain">Muscle Gain</option>
                  <option value="performance">Performance</option>
                  <option value="endurance">Endurance</option>
                </select>
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="sm:col-span-2 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
                {isSubmitting ? null : <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-8 text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600">
                Login
              </Link>
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  deleteWorkout as deleteWorkoutRequest,
  getWeeklySummary,
  getWorkouts,
  logWorkout,
} from '../../api/workout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';

function toLocalIso(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

const initialForm = {
  date: toLocalIso(),
  type: 'gym',
  exercise: '',
  sets: '',
  reps: '',
  weight_kg: '',
  duration_min: '',
  intensity: 5,
  soreness: 5,
  mood: 5,
  calories_burned: '',
  notes: '',
};

function buildWorkoutPayload(form) {
  return {
    date: form.date,
    type: form.type,
    exercise: form.exercise,
    duration_min: Number(form.duration_min),
    intensity: Number(form.intensity),
    soreness: Number(form.soreness),
    mood: Number(form.mood),
    sets: form.sets ? Number(form.sets) : undefined,
    reps: form.reps ? Number(form.reps) : undefined,
    weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
    calories_burned: form.calories_burned ? Number(form.calories_burned) : undefined,
    notes: form.notes || undefined,
  };
}

export default function WorkoutLogger() {
  const [form, setForm] = useState(initialForm);
  const [summary, setSummary] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadWorkouts = async () => {
    try {
      setIsLoading(true);
      const [summaryResponse, workoutsResponse] = await Promise.all([
        getWeeklySummary(),
        getWorkouts(),
      ]);

      setSummary(summaryResponse.data?.data ?? null);
      setWorkouts(workoutsResponse.data?.data ?? []);
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to load workouts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.date || !form.type || !form.exercise || !form.duration_min) {
      toast.error('Please complete the required workout fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await logWorkout(buildWorkoutPayload(form));
      toast.success('Workout logged successfully.');
      setForm(initialForm);
      await loadWorkouts();
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to log this workout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (workoutId) => {
    try {
      setDeletingId(workoutId);
      await deleteWorkoutRequest(workoutId);
      toast.success('Workout deleted.');
      await loadWorkouts();
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to delete workout.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading workouts..." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          eyebrow="Weekly Summary"
          title="Days Trained"
          value={summary?.count ?? 0}
          description="Sessions logged since the start of the week."
        />
        <StatCard
          eyebrow="Weekly Summary"
          title="Total Duration"
          value={summary?.total_duration ?? 0}
          suffix="min"
          description="Minutes invested in training so far."
        />
        <StatCard
          eyebrow="Weekly Summary"
          title="Avg Intensity"
          value={summary?.avg_intensity ?? 0}
          suffix="/10"
          description="Average effort level across weekly sessions."
        />
        <StatCard
          eyebrow="Weekly Summary"
          title="Training Load"
          value={summary?.total_training_load ?? 0}
          description="Combined load calculated from duration and intensity."
        />
      </section>

      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Workout Form</p>
          <h2 className="mt-2 font-body text-3xl font-semibold tracking-tight text-slate-950">Log today&apos;s workout</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Workout Type</span>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
            >
              <option value="gym">Gym</option>
              <option value="running">Running</option>
              <option value="sport">Sport</option>
              <option value="mobility">Mobility</option>
              <option value="rest">Rest</option>
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-semibold text-slate-700">Exercise Name</span>
            <input
              type="text"
              name="exercise"
              value={form.exercise}
              onChange={handleChange}
              placeholder="Back squat"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
            />
          </label>

          {[
            ['sets', 'Sets'],
            ['reps', 'Reps'],
            ['weight_kg', 'Weight (kg)'],
            ['duration_min', 'Duration (min)'],
            ['calories_burned', 'Calories Burned'],
          ].map(([name, label]) => (
            <label key={name}>
              <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
              <input
                type="number"
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
              />
            </label>
          ))}

          {[
            ['intensity', 'Intensity 1-10'],
            ['soreness', 'Soreness 1-10'],
            ['mood', 'Mood 1-10'],
          ].map(([name, label]) => (
            <label key={name}>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>{label}</span>
                <span className="font-mono text-blue-600">{form[name]}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-blue-100 accent-blue-600"
              />
            </label>
          ))}

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

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="4"
              placeholder="How did the session feel?"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="md:col-span-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Logging Workout...' : 'Log Workout'}
          </button>
        </form>
      </section>

      <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">History</p>
          <h2 className="mt-2 font-body text-3xl font-semibold tracking-tight text-slate-950">Recent workouts</h2>
        </div>

        {workouts.length ? (
          <div className="dashboard-scroll overflow-x-auto">
            <table className="min-w-[900px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.22em] text-slate-400">
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Type</th>
                  <th className="pb-4">Exercise</th>
                  <th className="pb-4">Duration</th>
                  <th className="pb-4">Intensity</th>
                  <th className="pb-4">Training Load</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workouts.map((workout) => (
                  <tr key={workout.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="py-4 text-sm font-medium text-slate-700">{workout.date}</td>
                    <td className="py-4 text-sm capitalize text-slate-500">{workout.type}</td>
                    <td className="py-4 text-sm text-slate-900">{workout.exercise}</td>
                    <td className="py-4 text-sm text-slate-500">{workout.duration_min} min</td>
                    <td className="py-4 text-sm text-slate-500">{workout.intensity}/10</td>
                    <td className="py-4 font-mono text-sm text-slate-900">{workout.training_load}</td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(workout.id)}
                        disabled={deletingId === workout.id}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-all duration-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === workout.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
            No workouts logged yet. Start with today&apos;s session to build your training history.
          </div>
        )}
      </section>
    </motion.div>
  );
}

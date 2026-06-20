import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import {
  deleteWorkout as deleteWorkoutRequest,
  getWeeklySummary,
  getWorkouts,
  logWorkout,
} from '../../api/workout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatCard from '../../components/ui/StatCard';
import { formatDisplayDate } from '../../utils/date';

function toLocalIso(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

const WORKOUT_CONFIG = {
  gym: {
    showExercise: true,
    showSetsReps: true,
    showWeight: true,
    showDistance: false,
    showPace: false,
    showResult: false,
    showFlexibility: false,
    showRecovery: false,
    showDuration: true,
    showIntensity: true,
    showSoreness: true,
    showMood: true,
    showCalories: true,
    requiresExercise: true,
    requiresDuration: true,
  },
  running: {
    showExercise: false,
    showSetsReps: false,
    showWeight: false,
    showDistance: true,
    showPace: true,
    showResult: false,
    showFlexibility: false,
    showRecovery: false,
    showDuration: true,
    showIntensity: true,
    showSoreness: true,
    showMood: true,
    showCalories: true,
    requiresExercise: false,
    requiresDuration: true,
  },
  cycling: {
    showExercise: false,
    showSetsReps: false,
    showWeight: false,
    showDistance: true,
    showPace: true,
    showResult: false,
    showFlexibility: false,
    showRecovery: false,
    showDuration: true,
    showIntensity: true,
    showSoreness: true,
    showMood: true,
    showCalories: true,
    requiresExercise: false,
    requiresDuration: true,
  },
  swimming: {
    showExercise: false,
    showSetsReps: false,
    showWeight: false,
    showDistance: true,
    showPace: true,
    showResult: false,
    showFlexibility: false,
    showRecovery: false,
    showDuration: true,
    showIntensity: true,
    showSoreness: true,
    showMood: true,
    showCalories: true,
    requiresExercise: false,
    requiresDuration: true,
  },
  badminton: {
    showExercise: false,
    showSetsReps: false,
    showWeight: false,
    showDistance: false,
    showPace: false,
    showResult: true,
    showFlexibility: false,
    showRecovery: false,
    showDuration: true,
    showIntensity: true,
    showSoreness: true,
    showMood: true,
    showCalories: true,
    requiresExercise: false,
    requiresDuration: true,
  },
  football: {
    showExercise: false,
    showSetsReps: false,
    showWeight: false,
    showDistance: false,
    showPace: false,
    showResult: true,
    showFlexibility: false,
    showRecovery: false,
    showDuration: true,
    showIntensity: true,
    showSoreness: true,
    showMood: true,
    showCalories: true,
    requiresExercise: false,
    requiresDuration: true,
  },
  basketball: {
    showExercise: false,
    showSetsReps: false,
    showWeight: false,
    showDistance: false,
    showPace: false,
    showResult: true,
    showFlexibility: false,
    showRecovery: false,
    showDuration: true,
    showIntensity: true,
    showSoreness: true,
    showMood: true,
    showCalories: true,
    requiresExercise: false,
    requiresDuration: true,
  },
  cricket: {
    showExercise: false,
    showSetsReps: false,
    showWeight: false,
    showDistance: false,
    showPace: false,
    showResult: true,
    showFlexibility: false,
    showRecovery: false,
    showDuration: true,
    showIntensity: true,
    showSoreness: true,
    showMood: true,
    showCalories: true,
    requiresExercise: false,
    requiresDuration: true,
  },
  mobility: {
    showExercise: false,
    showSetsReps: false,
    showWeight: false,
    showDistance: false,
    showPace: false,
    showResult: false,
    showFlexibility: true,
    showRecovery: false,
    showDuration: true,
    showIntensity: false,
    showSoreness: true,
    showMood: true,
    showCalories: false,
    requiresExercise: false,
    requiresDuration: true,
  },
  rest: {
    showExercise: false,
    showSetsReps: false,
    showWeight: false,
    showDistance: false,
    showPace: false,
    showResult: false,
    showFlexibility: false,
    showRecovery: true,
    showDuration: false,
    showIntensity: false,
    showSoreness: false,
    showMood: true,
    showCalories: false,
    requiresExercise: false,
    requiresDuration: false,
  },
  other: {
    showExercise: true,
    showSetsReps: false,
    showWeight: false,
    showDistance: false,
    showPace: false,
    showResult: false,
    showFlexibility: false,
    showRecovery: false,
    showDuration: true,
    showIntensity: true,
    showSoreness: true,
    showMood: true,
    showCalories: true,
    requiresExercise: true,
    requiresDuration: true,
  },
};

const WORKOUT_OPTIONS = [
  { value: 'gym', label: '🏋️ Gym / Strength' },
  { value: 'running', label: '🏃 Running' },
  { value: 'cycling', label: '🚴 Cycling' },
  { value: 'swimming', label: '🏊 Swimming' },
  { value: 'badminton', label: '🏸 Badminton' },
  { value: 'football', label: '⚽ Football' },
  { value: 'basketball', label: '🏀 Basketball' },
  { value: 'cricket', label: '🏏 Cricket' },
  { value: 'mobility', label: '🧘 Mobility / Yoga' },
  { value: 'rest', label: '😴 Rest / Recovery' },
  { value: 'other', label: '🏅 Other' },
];

const TYPE_META = {
  gym: { emoji: '🏋️', label: 'Gym / Strength', exercise: 'Strength Session' },
  running: { emoji: '🏃', label: 'Running', exercise: 'Running Session' },
  cycling: { emoji: '🚴', label: 'Cycling', exercise: 'Cycling Session' },
  swimming: { emoji: '🏊', label: 'Swimming', exercise: 'Swimming Session' },
  badminton: { emoji: '🏸', label: 'Badminton', exercise: 'Badminton Session' },
  football: { emoji: '⚽', label: 'Football', exercise: 'Football Session' },
  basketball: { emoji: '🏀', label: 'Basketball', exercise: 'Basketball Session' },
  cricket: { emoji: '🏏', label: 'Cricket', exercise: 'Cricket Session' },
  mobility: { emoji: '🧘', label: 'Mobility / Yoga', exercise: 'Mobility Session' },
  rest: { emoji: '😴', label: 'Rest / Recovery', exercise: 'Recovery Day' },
  other: { emoji: '🏅', label: 'Other', exercise: 'Training Session' },
};

const FIELD_TRANSITION = { duration: 0.2 };

const hiddenFieldResets = {
  exercise: '',
  sets: '',
  reps: '',
  weight_kg: '',
  distance_km: '',
  pace_min_km: '',
  match_result: '',
  flexibility_focus: '',
  recovery_activity: '',
  duration_min: '',
  calories_burned: '',
};

const initialForm = {
  date: toLocalIso(),
  type: 'gym',
  exercise: '',
  sets: '',
  reps: '',
  weight_kg: '',
  distance_km: '',
  pace_min_km: '',
  duration_min: '',
  intensity: 5,
  soreness: 5,
  mood: 5,
  match_result: '',
  flexibility_focus: '',
  recovery_activity: '',
  calories_burned: '',
  notes: '',
};

function getConfig(type) {
  return WORKOUT_CONFIG[type] || WORKOUT_CONFIG.other;
}

function getDisplayType(type) {
  return TYPE_META[type] || TYPE_META.other;
}

function getDefaultExercise(type) {
  return getDisplayType(type).exercise;
}

function buildSerializedNotes(form, config) {
  const extras = {};

  if (config.showDistance && form.distance_km) {
    extras.distance_km = Number(form.distance_km);
  }

  if (config.showPace && form.pace_min_km) {
    extras.pace_min_km = Number(form.pace_min_km);
  }

  if (config.showResult && form.match_result) {
    extras.match_result = form.match_result;
  }

  if (config.showFlexibility && form.flexibility_focus) {
    extras.flexibility_focus = form.flexibility_focus;
  }

  if (config.showRecovery && form.recovery_activity) {
    extras.recovery_activity = form.recovery_activity;
  }

  if (form.notes) {
    extras.text = form.notes;
  }

  return Object.keys(extras).length ? JSON.stringify(extras) : undefined;
}

function buildWorkoutPayload(form) {
  const config = getConfig(form.type);

  return {
    date: form.date,
    type: form.type,
    exercise: config.showExercise ? form.exercise : getDefaultExercise(form.type),
    duration_min: Number(form.duration_min || 0),
    intensity: Number(form.intensity || 5),
    soreness: Number(form.soreness || 5),
    mood: Number(form.mood || 5),
    sets: config.showSetsReps && form.sets ? Number(form.sets) : undefined,
    reps: config.showSetsReps && form.reps ? Number(form.reps) : undefined,
    weight_kg: config.showWeight && form.weight_kg ? Number(form.weight_kg) : undefined,
    calories_burned: config.showCalories && form.calories_burned ? Number(form.calories_burned) : undefined,
    notes: buildSerializedNotes(form, config),
  };
}

function resetFieldsForType(form, type) {
  const config = getConfig(type);
  const nextForm = { ...form, type };

  if (!config.showExercise) nextForm.exercise = hiddenFieldResets.exercise;
  if (!config.showSetsReps) {
    nextForm.sets = hiddenFieldResets.sets;
    nextForm.reps = hiddenFieldResets.reps;
  }
  if (!config.showWeight) nextForm.weight_kg = hiddenFieldResets.weight_kg;
  if (!config.showDistance) nextForm.distance_km = hiddenFieldResets.distance_km;
  if (!config.showPace) nextForm.pace_min_km = hiddenFieldResets.pace_min_km;
  if (!config.showResult) nextForm.match_result = hiddenFieldResets.match_result;
  if (!config.showFlexibility) nextForm.flexibility_focus = hiddenFieldResets.flexibility_focus;
  if (!config.showRecovery) nextForm.recovery_activity = hiddenFieldResets.recovery_activity;
  if (!config.showDuration) nextForm.duration_min = hiddenFieldResets.duration_min;
  if (!config.showCalories) nextForm.calories_burned = hiddenFieldResets.calories_burned;
  if (!config.showIntensity) nextForm.intensity = 5;
  if (!config.showSoreness) nextForm.soreness = 5;

  return nextForm;
}

function AnimatedField({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={FIELD_TRANSITION}
      className={`overflow-hidden ${className}`.trim()}
    >
      <div className="pt-0">{children}</div>
    </motion.div>
  );
}

export default function WorkoutLogger() {
  const [form, setForm] = useState(initialForm);
  const [summary, setSummary] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const currentConfig = useMemo(() => getConfig(form.type), [form.type]);

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

  useEffect(() => {
    if (!currentConfig.showPace) {
      if (form.pace_min_km !== '') {
        setForm((current) => ({ ...current, pace_min_km: '' }));
      }
      return;
    }

    const distance = Number(form.distance_km);
    const duration = Number(form.duration_min);

    if (!distance || !duration) {
      if (form.pace_min_km !== '') {
        setForm((current) => ({ ...current, pace_min_km: '' }));
      }
      return;
    }

    const nextPace = (duration / distance).toFixed(2);
    if (form.pace_min_km !== nextPace) {
      setForm((current) => ({ ...current, pace_min_km: nextPace }));
    }
  }, [currentConfig.showPace, form.distance_km, form.duration_min, form.pace_min_km]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'type') {
      setForm((current) => resetFieldsForType(current, value));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredExercise = currentConfig.requiresExercise && !form.exercise.trim();
    const requiredDuration = currentConfig.requiresDuration && !form.duration_min;
    const requiredDistance = currentConfig.showDistance && !form.distance_km;
    const requiredResult = currentConfig.showResult && !form.match_result;
    const requiredFlexibility = currentConfig.showFlexibility && !form.flexibility_focus;
    const requiredRecovery = currentConfig.showRecovery && !form.recovery_activity;

    if (!form.date || !form.type || requiredExercise || requiredDuration || requiredDistance || requiredResult || requiredFlexibility || requiredRecovery) {
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
              {WORKOUT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showExercise ? (
              <AnimatedField key="exercise">
                <label className="block">
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
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showSetsReps ? (
              <AnimatedField key="sets">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Sets</span>
                  <input
                    type="number"
                    name="sets"
                    value={form.sets}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  />
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showSetsReps ? (
              <AnimatedField key="reps">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Reps</span>
                  <input
                    type="number"
                    name="reps"
                    value={form.reps}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  />
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showWeight ? (
              <AnimatedField key="weight_kg">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Weight (kg)</span>
                  <input
                    type="number"
                    name="weight_kg"
                    value={form.weight_kg}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  />
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showDistance ? (
              <AnimatedField key="distance_km">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Distance (km)</span>
                  <input
                    type="number"
                    step="0.1"
                    name="distance_km"
                    value={form.distance_km}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  />
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showDuration ? (
              <AnimatedField key="duration_min">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Duration (min)</span>
                  <input
                    type="number"
                    name="duration_min"
                    value={form.duration_min}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  />
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showPace ? (
              <AnimatedField key="pace_min_km">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Pace (min/km)</span>
                  <input
                    type="number"
                    step="0.01"
                    name="pace_min_km"
                    value={form.pace_min_km}
                    readOnly
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
                  />
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showResult ? (
              <AnimatedField key="match_result">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Match Result</span>
                  <select
                    name="match_result"
                    value={form.match_result}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  >
                    <option value="">Select result</option>
                    <option value="win">Win</option>
                    <option value="loss">Loss</option>
                    <option value="draw">Draw</option>
                    <option value="practice">Practice</option>
                  </select>
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showFlexibility ? (
              <AnimatedField key="flexibility_focus">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Flexibility Focus</span>
                  <select
                    name="flexibility_focus"
                    value={form.flexibility_focus}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  >
                    <option value="">Select focus</option>
                    <option value="full_body">Full Body</option>
                    <option value="upper">Upper</option>
                    <option value="lower">Lower</option>
                    <option value="core">Core</option>
                  </select>
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showRecovery ? (
              <AnimatedField key="recovery_activity">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Recovery Activity</span>
                  <select
                    name="recovery_activity"
                    value={form.recovery_activity}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  >
                    <option value="">Select activity</option>
                    <option value="sleep">Sleep</option>
                    <option value="massage">Massage</option>
                    <option value="ice_bath">Ice Bath</option>
                    <option value="light_walk">Light Walk</option>
                  </select>
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showCalories ? (
              <AnimatedField key="calories_burned">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Calories Burned</span>
                  <input
                    type="number"
                    name="calories_burned"
                    value={form.calories_burned}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
                  />
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showIntensity ? (
              <AnimatedField key="intensity">
                <label className="block">
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>Intensity 1-10</span>
                    <span className="font-mono text-blue-600">{form.intensity}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    name="intensity"
                    value={form.intensity}
                    onChange={handleChange}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-blue-100 accent-blue-600"
                  />
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showSoreness ? (
              <AnimatedField key="soreness">
                <label className="block">
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>Soreness 1-10</span>
                    <span className="font-mono text-blue-600">{form.soreness}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    name="soreness"
                    value={form.soreness}
                    onChange={handleChange}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-blue-100 accent-blue-600"
                  />
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {currentConfig.showMood ? (
              <AnimatedField key="mood">
                <label className="block">
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>Mood 1-10</span>
                    <span className="font-mono text-blue-600">{form.mood}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    name="mood"
                    value={form.mood}
                    onChange={handleChange}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-blue-100 accent-blue-600"
                  />
                </label>
              </AnimatedField>
            ) : null}
          </AnimatePresence>

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
                {workouts.map((workout) => {
                  const typeMeta = getDisplayType(workout.type);

                  return (
                    <tr key={workout.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-4 text-sm font-medium text-slate-700">{formatDisplayDate(workout.date)}</td>
                      <td className="py-4 text-sm text-slate-500">{`${typeMeta.emoji} ${typeMeta.label}`}</td>
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
                  );
                })}
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

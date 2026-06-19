import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BatteryCharging,
  BrainCircuit,
  ChevronRight,
  Dumbbell,
  Footprints,
  HeartPulse,
  MoonStar,
  ShieldAlert,
  Sparkles,
  TimerReset,
  TrendingUp,
  Watch,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/Navbar';

const metricStrip = [
  { icon: Footprints, label: 'Steps', value: '14,280', trend: '+12%' },
  { icon: MoonStar, label: 'Sleep', value: '8.1 hrs', trend: '+0.6' },
  { icon: HeartPulse, label: 'Heart Rate', value: '52 bpm', trend: '-4 bpm' },
  { icon: Activity, label: 'Calories', value: '2,480', trend: '+9%' },
  { icon: Dumbbell, label: 'Training Load', value: '418', trend: '+7%' },
  { icon: Sparkles, label: 'Recovery Score', value: '87', trend: 'Fresh' },
];

const topFeatures = [
  {
    icon: BrainCircuit,
    title: 'Fatigue Prediction',
    description:
      'Athlete AI identifies when your body is trending toward fatigue so you can adapt before performance drops.',
    accent: 'text-blue-600',
  },
  {
    icon: ShieldAlert,
    title: 'Injury Risk Alert',
    description:
      'Surface hidden recovery warning signs using training load, soreness, and heart rate signals in one AI layer.',
    accent: 'text-red-400',
  },
  {
    icon: BatteryCharging,
    title: 'AI Workout Coach',
    description:
      'Get a session recommendation each morning based on readiness, recovery, and your athletic goal.',
    accent: 'text-emerald-400',
  },
];

const secondaryFeatures = [
  {
    title: 'Recovery Score',
    description: 'A single daily score combining sleep, soreness, load, and energy.',
  },
  {
    title: 'Body Fat Tracker',
    description: 'Estimate body composition trends manually or from photo analysis.',
  },
  {
    title: 'Performance Analytics',
    description: 'Track consistency, strength progress, calories, and composite performance.',
  },
];

const howItWorks = [
  {
    number: '01',
    icon: Watch,
    title: 'Log your workout + health data',
    description: 'Sync metrics from your day and keep training history in one clean athlete-first system.',
  },
  {
    number: '02',
    icon: BrainCircuit,
    title: 'AI analyzes fatigue, recovery, injury risk',
    description: 'Models turn your daily signals into actionable context instead of raw numbers.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Get personalized recommendations',
    description: 'Receive guidance for intensity, recovery, and your next training decision.',
  },
];

const dashboardFeatures = [
  'Daily recovery score and readiness report',
  'Weekly training load and consistency tracking',
  'Daily vitals logging with trend visualizations',
  'Body composition estimates and progress history',
];

const athleteStories = [
  {
    name: 'Aarav Mehta',
    sport: 'Badminton',
    quote: 'The AI fatigue signal helped me stop stacking hard days back to back. My legs feel fresher in matches.',
  },
  {
    name: 'Nina Brooks',
    sport: 'Running',
    quote: 'I finally have one dashboard where recovery, sleep, and training load all point to the same decision.',
  },
  {
    name: 'Leo Carter',
    sport: 'Strength',
    quote: 'Athlete AI made it obvious when to push and when to pull back. My progress feels much more intentional.',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$0',
    description: 'For athletes getting set up with workout and health logging.',
    features: ['Workout logging', 'Daily vitals metrics', 'Basic dashboard'],
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'For athletes who want daily AI guidance and full analytics.',
    features: ['AI coach report', 'Recovery insights', 'Advanced analytics'],
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$49',
    description: 'For coaches and performance teams supporting multiple athletes.',
    features: ['Shared review workflow', 'Priority support', 'Performance oversight'],
  },
];

export default function LandingPage() {
  return (
    <div className="bg-slate-50 text-slate-950">
      <Navbar />

      <main>
        <section className="hero-grid relative overflow-hidden bg-gradient-to-br from-blue-50 to-white px-6 pb-20 pt-36 text-slate-900 lg:px-10 lg:pt-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.18),_transparent_30%),radial-gradient(circle_at_left,_rgba(255,255,255,0.7),_transparent_24%)]" />
          <div className="relative mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="max-w-4xl">
                <p className="mb-6 text-sm font-semibold uppercase tracking-[0.35em] text-blue-600">
                  Premium AI fitness operating system
                </p>
                <h1 className="font-body text-[2.95rem] font-semibold leading-[0.98] tracking-tight text-slate-950 sm:text-[3.85rem] lg:text-[4.35rem]">
                  <span className="block">Train smarter.</span>
                  <span className="block text-blue-600">Recover with confidence.</span>
                  <span className="block">Perform with intent.</span>
                </h1>
                <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-600">
                  AI-powered coaching for athletes who want clearer training decisions, steadier
                  recovery, and more consistent performance.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-blue-700"
                  >
                    Start Free Today
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a
                    href="#dashboard-preview"
                    className="inline-flex items-center justify-center rounded-full border-2 border-blue-600 px-7 py-4 text-base font-semibold text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white"
                  >
                    Watch Demo
                  </a>
                </div>
              </div>

              <div className="mt-14 grid gap-4 sm:grid-cols-3">
                {[
                  ['10,000+', 'Athletes'],
                  ['94%', 'Recovery Accuracy'],
                  ['Real-time', 'AI Insights'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="font-display text-3xl tracking-tight text-slate-900">{value}</div>
                    <div className="mt-2 text-sm text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -left-10 top-8 hidden h-44 w-44 rounded-full bg-blue-600/15 blur-3xl lg:block" />
              <div className="absolute -right-8 bottom-10 hidden h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl lg:block" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                <div className="glass-panel rounded-[32px] p-6 shadow-athletic">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Recovery Score</span>
                    <span>Today</span>
                  </div>
                  <div className="mt-5 flex items-center gap-5">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-blue-600 text-4xl font-display uppercase text-slate-900">
                      87
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                        Athlete readiness
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">Primed for quality work</p>
                    </div>
                  </div>
                </div>

                <div className="glass-panel ml-auto max-w-sm rounded-[32px] p-5 lg:mr-10">
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Fatigue Signal
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-3xl font-display uppercase text-slate-900">Fresh</span>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">
                      Stable
                    </span>
                  </div>
                </div>

                <div className="glass-panel max-w-sm rounded-[32px] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Injury Risk
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-3xl font-display uppercase text-slate-900">Low</span>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">
                      Recovering well
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-white px-6 py-16 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Daily vitals intelligence
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
                Everything your daily vitals reveal, refined by AI.
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-6">
              {metricStrip.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-athletic"
                  >
                    <div className="flex items-center justify-between">
                      <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">{item.trend}</span>
                    </div>
                    <p className="mt-5 text-sm font-medium text-slate-500">{item.label}</p>
                    <p className="mt-2 font-mono text-3xl font-semibold text-slate-950">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="features" className="bg-slate-50 px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Features
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
                Your complete athletic intelligence platform
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {topFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-[30px] border border-slate-200 bg-white p-8 text-slate-900 shadow-athletic">
                    <div className={`inline-flex rounded-2xl bg-blue-50 p-3 ${feature.accent}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-8 font-display text-3xl tracking-tight">{feature.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {secondaryFeatures.map((feature) => (
                <div key={feature.title} className="rounded-[30px] border border-slate-100 bg-white p-8 shadow-sm">
                  <h3 className="font-display text-2xl tracking-tight text-slate-950">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Workflow
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
                3 steps to peak performance
              </h2>
            </div>

            <div className="relative mt-16 grid gap-8 lg:grid-cols-3">
              <div className="absolute left-[16.5%] right-[16.5%] top-10 hidden h-px bg-gradient-to-r from-blue-200 via-blue-600 to-blue-200 lg:block" />
              {howItWorks.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="relative rounded-[30px] border border-slate-100 bg-white p-8 shadow-sm">
                    <div className="relative z-10 inline-flex items-center gap-4">
                      <span className="font-display text-5xl tracking-tight text-blue-600">{step.number}</span>
                      <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="mt-6 font-display text-3xl tracking-tight text-slate-950">{step.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-500">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="dashboard-preview" className="bg-slate-50 px-6 py-24 text-slate-900 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Dashboard</p>
              <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
                A dashboard built for athletes
              </h2>

              <div className="mt-8 space-y-4">
                {dashboardFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-slate-200 bg-white p-5 shadow-athletic">
              <div className="rounded-[28px] bg-slate-50 p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-white p-5">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Recovery</div>
                    <div className="mt-4 font-display text-5xl tracking-tight text-blue-600">87</div>
                    <div className="mt-2 text-sm text-slate-600">Excellent readiness for a strength-focused session.</div>
                  </div>
                  <div className="rounded-3xl bg-white p-5 text-slate-950">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Weekly Load</div>
                    <div className="mt-4 font-mono text-4xl font-semibold">418</div>
                    <div className="mt-2 text-sm text-slate-500">Balanced progression across 5 training days.</div>
                  </div>
                  <div className="rounded-3xl bg-white p-5 text-slate-950">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Sleep Trend</div>
                    <div className="mt-4 flex h-20 items-end gap-2">
                      {[40, 64, 55, 72, 68, 78, 70].map((height, index) => (
                        <div
                          key={index}
                          className="w-full rounded-t-full bg-blue-600/80"
                          style={{ height: `${height}px` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-5">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">AI Coach</div>
                    <div className="mt-4 text-lg font-semibold text-slate-900">Recommendation</div>
                    <div className="mt-2 text-sm leading-7 text-slate-600">
                      Prioritize speed endurance, then finish with mobility to protect recovery.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="athletes" className="bg-white px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Athletes
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
                Trusted by athletes chasing a sharper edge
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {athleteStories.map((story) => (
                <div key={story.name} className="rounded-[30px] border border-slate-100 bg-slate-50 p-8 shadow-sm">
                  <p className="text-sm leading-8 text-slate-600">&ldquo;{story.quote}&rdquo;</p>
                  <div className="mt-8">
                    <div className="font-semibold text-slate-950">{story.name}</div>
                    <div className="text-sm text-slate-500">{story.sport} athlete</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-slate-50 px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
                Pricing
              </p>
              <h2 className="mt-4 font-display text-4xl tracking-tight text-slate-950 sm:text-5xl">
                Pick the performance stack that fits
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-[30px] border p-8 shadow-sm ${
                    plan.highlighted
                      ? 'border-blue-200 bg-white text-slate-950 shadow-athletic'
                      : 'border-slate-100 bg-white text-slate-950'
                  }`}
                >
                  <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${plan.highlighted ? 'text-blue-600' : 'text-blue-600'}`}>
                    {plan.name}
                  </p>
                  <div className="mt-5 font-display text-5xl tracking-tight text-slate-950">{plan.price}</div>
                  <p className="mt-4 text-sm leading-7 text-slate-500">
                    {plan.description}
                  </p>
                  <div className="mt-6 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <div key={feature} className="text-slate-600">
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/signup"
                    className={`mt-8 inline-flex rounded-full px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                      plan.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'border border-slate-200 bg-white text-slate-950 hover:border-blue-600 hover:text-blue-600'
                    }`}
                  >
                    Choose {plan.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-6 py-20 text-slate-900 lg:px-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Start today</p>
            <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">
              Ready to train smarter?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Build a better training rhythm with AI insights designed for athletes chasing real progress.
            </p>
            <Link
              to="/signup"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-blue-600 px-7 py-4 text-base font-semibold text-white transition-all duration-300 hover:bg-blue-700"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

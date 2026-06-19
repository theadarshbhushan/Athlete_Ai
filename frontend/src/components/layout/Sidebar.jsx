import {
  Activity,
  BarChart3,
  Bot,
  Clock3,
  Dumbbell,
  Home,
  LogOut,
  Trophy,
  Zap,
  UserRound,
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const navigation = [
  { label: 'Profile', to: '/dashboard/profile', icon: UserRound },
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Workout Log', to: '/dashboard/workout', icon: Dumbbell },
  { label: 'Daily Vitals', to: '/dashboard/smartwatch', icon: Clock3 },
  { label: 'AI Coach', to: '/dashboard/ai-coach', icon: Bot },
  { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Body Fat', to: '/dashboard/bodyfat', icon: Activity },
  { label: 'Sports', to: '/dashboard/sports', icon: Trophy },
];

function SidebarNavLink({ item, mobile = false }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-2xl transition-all duration-300',
          mobile ? 'flex-col px-2 py-2 text-[11px]' : 'px-4 py-3 text-sm font-semibold',
          isActive
            ? 'border-l-4 border-blue-600 bg-blue-50 text-blue-600'
            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600',
        ].join(' ')
      }
    >
      <Icon className={mobile ? 'h-4 w-4' : 'h-5 w-5'} />
      <span className={mobile ? 'truncate' : ''}>{item.label}</span>
    </NavLink>
  );
}

export default function Sidebar({ onLogout }) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-5 py-6 text-slate-900 lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-50 p-2 text-blue-600">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-2xl tracking-tight text-slate-950">Athlete AI</div>
            <div className="text-xs text-slate-400">Premium performance OS</div>
          </div>
        </Link>

        <nav className="mt-8 flex flex-col gap-2">
          {navigation.map((item) => (
            <SidebarNavLink key={item.to} item={item} />
          ))}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navigation.slice(0, 4).map((item) => (
            <SidebarNavLink key={item.to} item={item} mobile />
          ))}
        </div>
        <div className="mt-1 grid grid-cols-4 gap-1">
          {navigation.slice(4).map((item) => (
            <SidebarNavLink key={item.to} item={item} mobile />
          ))}
        </div>
      </nav>
    </>
  );
}

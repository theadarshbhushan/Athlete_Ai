import { Bell } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import AccountSwitcher from './AccountSwitcher';
import Sidebar from './Sidebar';

const titles = {
  '/dashboard': 'Dashboard',
  '/dashboard/workout': 'Workout Log',
  '/dashboard/smartwatch': 'Daily Vitals',
  '/dashboard/ai-coach': 'AI Coach',
  '/dashboard/analytics': 'Performance Analytics',
  '/dashboard/bodyfat': 'Body Composition',
  '/dashboard/sports': 'Sports Sessions',
  '/dashboard/profile': 'Athlete Profile',
};

function formatDateLabel() {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export default function DashboardLayout() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Sidebar onLogout={logout} />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                Athlete AI
              </p>
              <h1 className="font-body text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                {titles[location.pathname] || 'Dashboard'}
              </h1>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-semibold text-slate-900">{formatDateLabel()}</div>
                <div className="text-xs text-slate-500">Stay consistent today.</div>
              </div>

              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 transition-all duration-300 hover:border-blue-600 hover:text-blue-600"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>

              <AccountSwitcher />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-32 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

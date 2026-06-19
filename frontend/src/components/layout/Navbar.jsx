import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import AccountSwitcher from './AccountSwitcher';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Athletes', href: '#athletes' },
  { label: 'Pricing', href: '#pricing' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-slate-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-black tracking-wide text-blue-600">
          <Zap className="h-5 w-5 fill-blue-600" />
          <span className="font-display text-2xl tracking-tight text-slate-950">Athlete AI</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-700 lg:flex">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="transition-all duration-300 hover:text-blue-600"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {token ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-blue-600 hover:text-blue-600"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <AccountSwitcher />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border-2 border-blue-200 px-5 py-2.5 text-sm font-semibold text-blue-600 transition-all duration-300 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700"
              >
                Start Free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex rounded-full border border-slate-200 p-2 text-slate-800 transition-all duration-300 hover:border-blue-600 hover:text-blue-600 lg:hidden"
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-3 max-w-7xl rounded-3xl border border-slate-200 bg-white p-4 shadow-athletic lg:hidden"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl px-4 py-3 font-medium text-slate-700 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600"
                >
                  {item.label}
                </a>
              ))}
              <Link
                to={token ? '/dashboard' : '/login'}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-800"
              >
                {token ? 'Dashboard' : 'Login'}
              </Link>
              <Link
                to={token ? '/dashboard/profile' : '/signup'}
                onClick={() => setIsOpen(false)}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-center font-semibold text-white"
              >
                {token ? 'My Account' : 'Start Free'}
              </Link>
              {token ? <AccountSwitcher compact /> : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

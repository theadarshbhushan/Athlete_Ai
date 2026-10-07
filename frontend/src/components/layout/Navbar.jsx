import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Menu, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import AccountSwitcher from './AccountSwitcher';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Athletes', href: '#athletes' },
  { label: 'Pricing', href: '#pricing' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuth();

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-close menu if resized to desktop viewport (>= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md sm:px-6">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 text-lg font-black tracking-wide text-blue-600"
          >
            <Zap className="h-5 w-5 fill-blue-600" />
            <span className="font-display text-2xl tracking-tight text-slate-950">Athlete AI</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-700 md:flex lg:gap-8">
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

          {/* Desktop Action Buttons */}
          <div className="hidden items-center gap-3 md:flex">
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

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex rounded-full border border-slate-200 p-2 text-slate-800 transition-all duration-300 hover:border-blue-600 hover:text-blue-600 md:hidden"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Fullscreen Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Mobile Drawer/Modal */}
            <div className="fixed inset-x-0 top-0 p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative mx-auto max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-lg font-black tracking-wide text-blue-600"
                  >
                    <Zap className="h-5 w-5 fill-blue-600" />
                    <span className="font-display text-2xl tracking-tight text-slate-950">Athlete AI</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
                    aria-label="Close navigation"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="mt-4 flex flex-col gap-1">
                  {navLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-4">
                  {token ? (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3.5 text-center font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="rounded-2xl border-2 border-blue-200 px-4 py-3.5 text-center font-semibold text-blue-600 transition-colors hover:border-blue-600 hover:bg-blue-50"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsOpen(false)}
                        className="rounded-2xl bg-blue-600 px-4 py-3.5 text-center font-semibold text-white shadow-md transition-all hover:bg-blue-700"
                      >
                        Start Free
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
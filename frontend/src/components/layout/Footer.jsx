import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-900">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <div className="font-display text-3xl tracking-tight text-blue-600">
            Athlete AI
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
            Train smarter. Recover better. Perform stronger.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl tracking-tight">Product</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <a href="#features" className="block transition-all duration-300 hover:text-blue-600">
              Features
            </a>
            <a href="#pricing" className="block transition-all duration-300 hover:text-blue-600">
              Pricing
            </a>
            <Link to="/signup" className="block transition-all duration-300 hover:text-blue-600">
              Start Free
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl tracking-tight">Company</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <a href="#athletes" className="block transition-all duration-300 hover:text-blue-600">
              Athletes
            </a>
            <a href="#how-it-works" className="block transition-all duration-300 hover:text-blue-600">
              How it Works
            </a>
            <span className="block">Careers</span>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl tracking-tight">Support</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <span className="block">Help Center</span>
            <span className="block">Privacy</span>
            <span className="block">Contact</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 px-6 py-6 text-sm text-slate-500 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Athlete AI. All rights reserved.</span>
          <span>Made for athletes, by athletes.</span>
        </div>
      </div>
    </footer>
  );
}

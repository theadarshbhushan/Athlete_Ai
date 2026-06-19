import { ChevronDown, LogIn, Trash2, UserCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

export default function AccountSwitcher({ compact = false }) {
  const { user, savedAccounts, switchAccount, removeSavedAccount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${compact ? 'w-full' : ''}`}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex items-center gap-3 rounded-full border border-slate-200 bg-white transition-all duration-300 hover:border-blue-600 ${
          compact ? 'w-full justify-between px-3 py-2.5' : 'px-3 py-2'
        }`}
      >
        <div className="flex items-center gap-3">
          <UserCircle2 className="h-8 w-8 text-blue-600" />
          <div className="text-left">
            <div className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
              {user?.name || 'Athlete'}
            </div>
            <div className="text-xs text-slate-500 capitalize">{user?.goal || 'performance'}</div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div className={`absolute z-50 mt-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-athletic ${compact ? 'left-0 right-0' : 'right-0 w-[320px]'}`}>
          <div className="space-y-2">
            {savedAccounts.length ? (
              savedAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`flex items-center justify-between rounded-2xl border px-3 py-3 ${
                    account.id === user?.id
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={async () => {
                      setIsOpen(false);
                      if (account.id !== user?.id) {
                        await switchAccount(account.id);
                      }
                    }}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="truncate text-sm font-semibold text-slate-900">{account.name}</div>
                  <div className="truncate text-xs text-slate-500">
                    {account.email || account.sport || 'Saved account'}
                  </div>
                </button>

                  <button
                    type="button"
                    onClick={() => removeSavedAccount(account.id)}
                    className="ml-3 rounded-full p-2 text-slate-400 transition-all duration-300 hover:bg-slate-100 hover:text-red-500"
                    aria-label={`Remove ${account.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No saved accounts yet.
              </div>
            )}
          </div>

          <Link
            to="/login?switch=1"
            onClick={() => setIsOpen(false)}
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700"
          >
            <LogIn className="h-4 w-4" />
            Use another account
          </Link>
        </div>
      ) : null}
    </div>
  );
}

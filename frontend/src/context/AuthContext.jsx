import { createContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { getMe, login as loginRequest, register as registerRequest } from '../api/auth';

export const AuthContext = createContext(null);

const ATHLETE_TOKEN_KEY = 'athlete_token';
const ATHLETE_ACCOUNTS_KEY = 'athlete_saved_accounts';

function readSavedAccounts() {
  try {
    const raw = localStorage.getItem(ATHLETE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeSavedAccounts(accounts) {
  localStorage.setItem(ATHLETE_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function toSavedAccount(user, token) {
  return {
    id: user?.id,
    name: user?.name || 'Athlete',
    email: user?.email || '',
    sport: user?.sport || '',
    goal: user?.goal || '',
    token,
    lastUsedAt: new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(ATHLETE_TOKEN_KEY));
  const [savedAccounts, setSavedAccounts] = useState(readSavedAccounts);
  const [isLoading, setIsLoading] = useState(true);

  const rememberAccount = (nextUser, nextToken) => {
    const nextEntry = toSavedAccount(nextUser, nextToken);
    const current = readSavedAccounts().filter((account) => account.id !== nextEntry.id);
    const nextAccounts = [nextEntry, ...current].slice(0, 8);
    writeSavedAccounts(nextAccounts);
    setSavedAccounts(nextAccounts);
  };

  const removeSavedAccount = (accountId) => {
    const nextAccounts = readSavedAccounts().filter((account) => account.id !== accountId);
    writeSavedAccounts(nextAccounts);
    setSavedAccounts(nextAccounts);

    if (user?.id === accountId) {
      localStorage.removeItem(ATHLETE_TOKEN_KEY);
      setToken(null);
      setUser(null);
      navigate('/', { replace: true });
    }
  };

  useEffect(() => {
    let ignore = false;

    const restoreSession = async () => {
      const storedToken = localStorage.getItem(ATHLETE_TOKEN_KEY);

      if (!storedToken) {
        if (!ignore) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await getMe();
        const nextUser = response.data?.data ?? null;

        if (!ignore) {
          setToken(storedToken);
          setUser(nextUser);
          rememberAccount(nextUser, storedToken);
        }
      } catch (error) {
        localStorage.removeItem(ATHLETE_TOKEN_KEY);
        if (!ignore) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      ignore = true;
    };
  }, []);

  const login = async (email, password) => {
    const response = await loginRequest({ email, password });
    const payload = response.data?.data;

    localStorage.setItem(ATHLETE_TOKEN_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
    rememberAccount(payload.user, payload.token);
    toast.success('Welcome back.');
    navigate('/dashboard', { replace: true });
    return payload.user;
  };

  const signup = async (formData) => {
    const response = await registerRequest(formData);
    const payload = response.data?.data;

    localStorage.setItem(ATHLETE_TOKEN_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
    rememberAccount(payload.user, payload.token);
    toast.success('Account created successfully.');
    navigate('/dashboard', { replace: true });
    return payload.user;
  };

  const logout = () => {
    localStorage.removeItem(ATHLETE_TOKEN_KEY);
    setToken(null);
    setUser(null);
    toast.success('Signed out.');
    navigate('/', { replace: true });
  };

  const refreshUser = async () => {
    const response = await getMe();
    const profile = response.data?.data ?? null;
    setUser(profile);
    if (token && profile) {
      rememberAccount(profile, token);
    }
    return profile;
  };

  const switchAccount = async (accountId) => {
    const account = readSavedAccounts().find((item) => item.id === accountId);
    const previousToken = token;
    const previousUser = user;

    if (!account?.token) {
      toast.error('That saved account is no longer available.');
      return false;
    }

    localStorage.setItem(ATHLETE_TOKEN_KEY, account.token);
    setToken(account.token);

    try {
      const response = await getMe();
      const nextUser = response.data?.data ?? null;
      setUser(nextUser);
      rememberAccount(nextUser, account.token);
      toast.success(`Switched to ${nextUser?.name || 'account'}.`);
      navigate('/dashboard', { replace: true });
      return true;
    } catch (error) {
      const nextAccounts = readSavedAccounts().filter((item) => item.id !== accountId);
      writeSavedAccounts(nextAccounts);
      setSavedAccounts(nextAccounts);

      if (previousToken) {
        localStorage.setItem(ATHLETE_TOKEN_KEY, previousToken);
        setToken(previousToken);
        setUser(previousUser);
      } else {
        localStorage.removeItem(ATHLETE_TOKEN_KEY);
        setToken(null);
        setUser(null);
      }

      toast.error('Unable to switch to that account. Please sign in again.');
      return false;
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      savedAccounts,
      isLoading,
      login,
      signup,
      logout,
      refreshUser,
      switchAccount,
      removeSavedAccount,
      setUser,
    }),
    [user, token, savedAccounts, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

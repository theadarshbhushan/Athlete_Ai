import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAuth } from './hooks/useAuth';

const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const SignupPage = lazy(() => import('./pages/public/SignupPage'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const WorkoutLogger = lazy(() => import('./pages/dashboard/WorkoutLogger'));
const SmartwatchData = lazy(() => import('./pages/dashboard/SmartwatchData'));
const AICoach = lazy(() => import('./pages/dashboard/AICoach'));
const Analytics = lazy(() => import('./pages/dashboard/Analytics'));
const BodyFat = lazy(() => import('./pages/dashboard/BodyFat'));
const SportsSession = lazy(() => import('./pages/dashboard/SportsSession'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));

function RouteTransition() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-full"
    >
      <Outlet />
    </motion.div>
  );
}

function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullscreen label="Restoring session..." />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const { token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullscreen label="Loading Athlete AI..." />;
  }

  const allowWhileAuthenticated =
    location.pathname === '/login' && new URLSearchParams(location.search).get('switch') === '1';

  if (token && !allowWhileAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullscreen label="Loading page..." />}>
      <Routes>
        <Route element={<RouteTransition />}>
          <Route path="/" element={<LandingPage />} />
        </Route>

        <Route element={<PublicRoute />}>
          <Route element={<RouteTransition />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route element={<RouteTransition />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/dashboard/workout" element={<WorkoutLogger />} />
              <Route path="/dashboard/smartwatch" element={<SmartwatchData />} />
              <Route path="/dashboard/ai-coach" element={<AICoach />} />
              <Route path="/dashboard/analytics" element={<Analytics />} />
              <Route path="/dashboard/bodyfat" element={<BodyFat />} />
              <Route path="/dashboard/sports" element={<SportsSession />} />
              <Route path="/dashboard/profile" element={<Profile />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

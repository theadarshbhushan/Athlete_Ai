import { motion } from 'framer-motion';
import { Camera, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getProfile, updatePassword, updateProfile } from '../../api/user';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import RiskBadge from '../../components/ui/RiskBadge';
import { useAuth } from '../../hooks/useAuth';
import { formatDisplayDate } from '../../utils/date';

export default function Profile() {
  const { user, refreshUser, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    sport: 'gym',
    goal: 'performance',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getProfile();
      const data = response.data?.data ?? null;
      setProfile(data);
      setProfileForm({
        name: data?.name || '',
        age: data?.age || '',
        height: data?.height || '',
        weight: data?.weight || '',
        gender: data?.gender || '',
        sport: data?.sport || 'gym',
        goal: data?.goal || 'performance',
      });
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSavingProfile(true);
      const response = await updateProfile({
        name: profileForm.name || undefined,
        age: profileForm.age ? Number(profileForm.age) : undefined,
        height: profileForm.height ? Number(profileForm.height) : undefined,
        weight: profileForm.weight ? Number(profileForm.weight) : undefined,
        sport: profileForm.sport,
        goal: profileForm.goal,
      });
      const updatedProfile = response.data?.data ?? null;

      if (updatedProfile) {
        setProfile(updatedProfile);
        setProfileForm({
          name: updatedProfile.name || '',
          age: updatedProfile.age || '',
          height: updatedProfile.height || '',
          weight: updatedProfile.weight || '',
          gender: updatedProfile.gender || '',
          sport: updatedProfile.sport || 'gym',
          goal: updatedProfile.goal || 'performance',
        });
        setUser(updatedProfile);
      }

      await refreshUser();
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      toast.error('Please complete all password fields.');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setIsSavingPassword(true);
      await updatePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast.success('Password updated.');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error?.response?.data?.detail?.message || 'Unable to update password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Loading athlete profile..." />;
  }

  const initials = (profile?.name || user?.name || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.25fr]">
        <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-600 font-display text-6xl uppercase text-white">
              {initials || 'A'}
            </div>
            <h2 className="mt-6 font-display text-4xl tracking-tight text-slate-950">{profile?.name || 'Athlete'}</h2>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <RiskBadge level={profile?.sport || 'Sport'} />
              <RiskBadge level={profile?.goal || 'Goal'} />
            </div>
            <p className="mt-6 text-sm text-slate-500">
              Member since {profile?.created_at ? formatDisplayDate(profile.created_at) : '19-06-2026'}
            </p>
            <button
              type="button"
              onClick={() => toast('Photo uploads are not available in the current backend yet.')}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-700"
            >
              <Camera className="h-4 w-4" />
              Edit Photo
            </button>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Edit Profile</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              ['name', 'Name', false],
              ['age', 'Age', false],
              ['height', 'Height', false],
              ['weight', 'Weight', false],
              ['gender', 'Gender', true],
            ].map(([name, label, disabled]) => (
              <label key={name}>
                <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
                <input
                  type={name === 'name' || name === 'gender' ? 'text' : 'number'}
                  name={name}
                  disabled={disabled}
                  value={profileForm[name]}
                  onChange={handleProfileChange}
                  className={`w-full rounded-2xl border px-4 py-3 outline-none transition-all duration-300 ${
                    disabled
                      ? 'border-slate-100 bg-slate-50 text-slate-400'
                      : 'border-slate-200 focus:border-blue-600'
                  }`}
                />
              </label>
            ))}

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Sport</span>
              <select
                name="sport"
                value={profileForm.sport}
                onChange={handleProfileChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
              >
                <option value="badminton">Badminton</option>
                <option value="running">Running</option>
                <option value="gym">Gym</option>
                <option value="cycling">Cycling</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Goal</span>
              <select
                name="goal"
                value={profileForm.goal}
                onChange={handleProfileChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
              >
                <option value="fat loss">Fat Loss</option>
                <option value="muscle gain">Muscle Gain</option>
                <option value="performance">Performance</option>
                <option value="endurance">Endurance</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSavingProfile}
            className="mt-8 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSavingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      <section className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Security</p>
          <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950">Change password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="grid gap-5 md:grid-cols-3">
          {[
            ['current_password', 'Current Password'],
            ['new_password', 'New Password'],
            ['confirm_password', 'Confirm Password'],
          ].map(([name, label]) => (
            <label key={name}>
              <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
              <input
                type="password"
                name={name}
                value={passwordForm[name]}
                onChange={handlePasswordChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition-all duration-300 focus:border-blue-600"
              />
            </label>
          ))}

          <button
            type="submit"
            disabled={isSavingPassword}
            className="md:col-span-3 mt-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSavingPassword ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </section>

      <section className="rounded-[32px] border border-red-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-red-500">Danger Zone</p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-slate-950">Delete account</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              The current backend does not expose an account deletion endpoint yet, so this control is intentionally non-destructive.
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast.error('Delete account is not available in the current API yet.')}
            className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-3 font-semibold text-red-500 transition-all duration-300 hover:bg-red-50"
          >
            <ShieldAlert className="h-4 w-4" />
            Delete Account
          </button>
        </div>
      </section>
    </motion.div>
  );
}

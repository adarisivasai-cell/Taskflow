import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, CheckCircle2, Clock, FolderKanban, Save, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user, updateCurrentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    department: '',
    avatar: '',
    password: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProfile = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await userAPI.getUserById(user._id);
      if (res.data?.success) {
        setProfileData(res.data.user);
        setFormData({
          name: res.data.user.name || '',
          bio: res.data.user.bio || '',
          department: res.data.user.department || '',
          avatar: res.data.user.avatar || '',
          password: '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?._id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSuccessMessage('');
      const payload = {
        name: formData.name,
        bio: formData.bio,
        department: formData.department,
        avatar: formData.avatar,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await userAPI.updateUser(user._id, payload);
      if (res.data?.success) {
        updateCurrentUser(res.data.user);
        setProfileData((prev) => ({ ...prev, ...res.data.user }));
        setIsEditing(false);
        setSuccessMessage('Profile information saved successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading profile metrics..." size="lg" />;
  }

  const u = profileData || user;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          User Profile & Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View your assigned portfolio, track performance metrics, and manage your account
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 text-xs font-semibold">
          {successMessage}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={
                u.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  u.name
                )}&background=6366f1&color=fff`
              }
              alt={u.name}
              className="w-20 h-20 rounded-3xl object-cover ring-4 ring-brand-500/20 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {u.name}
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                  {u.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {u.email}
              </p>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1">
                {u.department || 'Product Engineering'}
              </p>
            </div>
          </div>

          <Button
            variant={isEditing ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            icon={Edit3}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </Button>
        </div>

        {/* Workload Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Assigned Tasks
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {u.totalTasks || u.totalAssignedTasks || 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
              Completed Tasks
            </span>
            <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {u.completedTasks || 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 block mb-1">
              Pending Tasks
            </span>
            <span className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">
              {u.pendingTasks || 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-1">
              Active Projects
            </span>
            <span className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
              {u.projects?.length || u.activeProjects || 0}
            </span>
          </div>
        </div>

        {/* Member Bio or Info */}
        {!isEditing && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Bio & Engineering Focus
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {u.bio || 'No personal bio added yet.'}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <Calendar className="w-4 h-4" />
              <span>
                Joined TaskFlow on {new Date(u.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Department / Focus"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Frontend Engineering"
              />

              <Input
                label="Avatar URL (Optional)"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <Input
              label="Bio / Notes"
              as="textarea"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell your team about yourself..."
            />

            <Input
              label="Update Password (Leave blank to keep existing)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
            />

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSaving} icon={Save}>
                Save Profile
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;

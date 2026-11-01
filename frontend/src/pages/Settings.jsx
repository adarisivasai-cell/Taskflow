import React from 'react';
import { Settings as SettingsIcon, Sun, Moon, Bell, Shield, Server, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Settings = () => {
  const { theme, setTheme, isDark } = useTheme();
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          Settings & Customization
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure interface appearance, notifications, and application preferences
        </p>
      </div>

      {/* Theme Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          {isDark ? (
            <Moon className="w-5 h-5 text-indigo-400" />
          ) : (
            <Sun className="w-5 h-5 text-amber-500" />
          )}
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Interface Theme Preference
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose between light and dark modes. Your choice is automatically persisted in local storage.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
          {/* Light Mode Option */}
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'light'
                ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20 text-brand-900'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Sun className="w-5 h-5 text-amber-500" />
              {theme === 'light' && <Check className="w-4 h-4 text-brand-600" />}
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Light Mode</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Crisp high contrast paper styling</p>
          </button>

          {/* Dark Mode Option */}
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'dark'
                ? 'border-brand-500 bg-brand-950/40 ring-2 ring-brand-500/20 text-white'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              {theme === 'dark' && <Check className="w-4 h-4 text-brand-400" />}
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Reduced eye strain in low-light</p>
          </button>
        </div>
      </div>

      {/* Security & Session Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <Shield className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Security & Authentication Status
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          TaskFlow uses industry-standard JWT token authorization with bcrypt password hashing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-0.5 font-semibold">Active Session</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{user?.email}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-0.5 font-semibold">Account Role</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">{user?.role} Access</span>
          </div>
        </div>
      </div>

      {/* Backend & Database Telemetry */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <Server className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            System Architecture
          </h2>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            • <strong>Module 1 & 2:</strong> React 18, Vite, React Router 6, Tailwind CSS, Lucide icons.
          </p>
          <p>
            • <strong>Module 3:</strong> Node.js, Express.js REST APIs with JWT & bcrypt middleware.
          </p>
          <p>
            • <strong>Module 4:</strong> MongoDB database with Mongoose schemas (User, Project, Task, Comment, Notification).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;

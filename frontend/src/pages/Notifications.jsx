import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Clock, CheckCircle2, MessageSquare, AlertCircle, FolderKanban } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'status_changed':
        return <Clock className="w-4 h-4 text-purple-500" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'project_assigned':
        return <FolderKanban className="w-4 h-4 text-indigo-500" />;
      case 'task_overdue':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Notifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Stay on top of updates, assignments, comments, and project progress
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            icon={CheckCheck}
          >
            Mark All as Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          description={
            filter === 'unread'
              ? "You're completely caught up with all updates!"
              : 'Notifications about task assignments, comments, and project changes will appear here.'
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
          {filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                !notification.read
                  ? 'bg-brand-50/20 dark:bg-brand-950/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {notification.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.createdAt).toLocaleDateString()}{' '}
                    {new Date(notification.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="capitalize font-semibold text-slate-500 dark:text-slate-400">
                    {notification.type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  title="Mark as read"
                  className="p-1.5 rounded-xl text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

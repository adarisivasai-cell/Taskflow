import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle2, Clock, AlertCircle, Search } from 'lucide-react';
import { taskAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskDetailModal from '../components/TaskDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const MyTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const params = {
        myTasks: 'true',
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const [taskRes, userRes] = await Promise.all([
        taskAPI.getTasks(params),
        userAPI.getUsers(),
      ]);

      if (taskRes.data?.success) {
        setTasks(taskRes.data.tasks || []);
      }
      if (userRes.data?.success) {
        setUsers(userRes.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load my tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [search, statusFilter]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const overdue = tasks.filter((t) => t.isOverdue).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Assigned Deliverables
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Everything specifically assigned to you across all active projects
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">My Total Tasks</span>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{total}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">In Progress</span>
          <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{inProgress}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Completed</span>
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{completed}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Overdue</span>
          <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{overdue}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search within your tasks..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Cards List */}
      {loading ? (
        <LoadingSpinner label="Loading your assignments..." size="lg" />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No tasks assigned to you"
          description="You're all caught up! Check back when new deliverables are assigned to you."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              showProject={true}
              onClick={() => setSelectedTaskId(task._id)}
            />
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          isOpen={Boolean(selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => fetchMyTasks()}
          onTaskDeleted={() => {
            setSelectedTaskId(null);
            fetchMyTasks();
          }}
          users={users}
        />
      )}
    </div>
  );
};

export default MyTasks;

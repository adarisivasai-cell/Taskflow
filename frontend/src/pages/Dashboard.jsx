import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Activity,
  Plus,
  Columns3,
  ListTodo,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { dashboardAPI, projectAPI, userAPI, taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Input from '../components/Input';
import TaskDetailModal from '../components/TaskDetailModal';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);

  // New Project Modal State
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Active',
  });
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);

  // New Task Modal State
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
  });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, projRes, userRes] = await Promise.all([
        dashboardAPI.getStats(),
        projectAPI.getProjects(),
        userAPI.getUsers(),
      ]);

      if (dashRes.data?.success) {
        setData(dashRes.data);
      }
      if (projRes.data?.success) {
        setProjects(projRes.data.projects || []);
      }
      if (userRes.data?.success) {
        setUsers(userRes.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) return;
    try {
      setIsSubmittingProject(true);
      await projectAPI.createProject(projectForm);
      setNewProjectModalOpen(false);
      setProjectForm({
        name: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Active',
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.project) {
      alert('Task title and project are required');
      return;
    }
    try {
      setIsSubmittingTask(true);
      await taskAPI.createTask(taskForm);
      setNewTaskModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        project: projects[0]?._id || '',
        assignedTo: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: '',
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Compiling live metrics..." size="lg" />;
  }

  const stats = data?.stats || {};
  const projectStats = stats.projects || {};
  const taskStats = stats.tasks || {};
  const priorityBreakdown = stats.priorityBreakdown || {};

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/10">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-white/15 text-white backdrop-blur-sm mb-2">
            Overview & Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-sm text-indigo-100 mt-1 max-w-xl">
            Here's what is happening across your projects, sprints, and team deliverables today.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isAdmin && (
            <Button
              onClick={() => setNewProjectModalOpen(true)}
              variant="secondary"
              size="sm"
              icon={Plus}
              className="bg-white text-brand-700 hover:bg-slate-100 dark:bg-white dark:text-brand-700 border-none shadow-md"
            >
              New Project
            </Button>
          )}
          <Button
            onClick={() => {
              if (projects.length > 0 && !taskForm.project) {
                setTaskForm((prev) => ({ ...prev, project: projects[0]._id }));
              }
              setNewTaskModalOpen(true);
            }}
            variant="secondary"
            size="sm"
            icon={Plus}
            className="bg-brand-800 text-white hover:bg-brand-900 border-transparent dark:bg-brand-900"
          >
            New Task
          </Button>
          <Link to="/kanban">
            <Button
              variant="outline"
              size="sm"
              icon={Columns3}
              className="border-white/30 text-white hover:bg-white/10 dark:hover:bg-white/10"
            >
              Kanban Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Projects</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {projectStats.total || 0}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {projectStats.active || 0} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {projectStats.completed || 0} Completed • {projectStats.planning || 0} Planning
          </p>
        </div>

        {/* Total Tasks */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {taskStats.total || 0}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              {taskStats.inProgress || 0} In Progress
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {taskStats.pending || 0} To Do • {taskStats.review || 0} In Review
          </p>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {taskStats.completed || 0}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {stats.completionRate || 0}% Rate
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Resolved deliverables across all active projects
          </p>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {taskStats.overdue || 0}
            </span>
            {taskStats.overdue > 0 ? (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                Action Required
              </span>
            ) : (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                On Schedule
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Past due deadline and not yet completed
          </p>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress & Priority Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Task Execution Health & Progress
              </h2>
            </div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-full">
              {stats.completionRate || 0}% Overall Completion
            </span>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span>Overall Deliverable Progress</span>
              <span>{taskStats.completed || 0} of {taskStats.total || 0} Tasks Done</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-500 transition-all duration-700"
                style={{ width: `${stats.completionRate || 0}%` }}
              />
            </div>
          </div>

          {/* Priority Breakdown Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Task Priority Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 block mb-1">
                  Urgent
                </span>
                <span className="text-xl font-extrabold text-rose-800 dark:text-rose-300">
                  {priorityBreakdown.Urgent || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block mb-1">
                  High
                </span>
                <span className="text-xl font-extrabold text-amber-800 dark:text-amber-300">
                  {priorityBreakdown.High || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 block mb-1">
                  Medium
                </span>
                <span className="text-xl font-extrabold text-blue-800 dark:text-blue-300">
                  {priorityBreakdown.Medium || 0}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Low
                </span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-slate-200">
                  {priorityBreakdown.Low || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>
              <span className="text-xs text-slate-400">Live Feed</span>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {!data?.recentActivity || data.recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-8">
                  No recent activities recorded.
                </p>
              ) : (
                data.recentActivity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <img
                      src={
                        act.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          act.user || 'User'
                        )}&background=6366f1&color=fff`
                      }
                      alt={act.user}
                      className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug">
                        <strong className="text-slate-900 dark:text-white">{act.user}</strong>{' '}
                        {act.type === 'task_completed' && 'completed task'}
                        {act.type === 'task_updated' && 'updated task'}
                        {act.type === 'comment_added' && 'commented:'}
                        {act.type === 'project_created' && 'created project'}{' '}
                        <span className="text-brand-600 dark:text-brand-400 font-semibold truncate">
                          "{act.title}"
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(act.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {new Date(act.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/tasks"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
            >
              View all tasks & updates <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Active Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Active Projects
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-priority engineering and operations initiatives
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Explore all ({projects.length}) <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.slice(0, 3).map((project) => (
            <ProjectCard key={project._id} project={project} canManage={isAdmin} />
          ))}
        </div>
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        title="Create New Project"
        subtitle="Initialize a new project workspace for your team"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. NextGen Microservices Platform"
            value={projectForm.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            as="textarea"
            rows={3}
            placeholder="Outline goals, deliverables, and architecture considerations..."
            value={projectForm.description}
            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Priority"
              as="select"
              value={projectForm.priority}
              onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </Input>
            <Input
              label="Initial Status"
              as="select"
              value={projectForm.status}
              onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </Input>
          </div>
          <Input
            label="Target Due Date"
            type="date"
            value={projectForm.dueDate}
            onChange={(e) => setProjectForm({ ...projectForm, dueDate: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingProject}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Task Modal */}
      <Modal
        isOpen={newTaskModalOpen}
        onClose={() => setNewTaskModalOpen(false)}
        title="Create New Task"
        subtitle="Add a trackable ticket to a project"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Configure SSL TLS 1.3 reverse proxy"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />
          <Input
            label="Project"
            as="select"
            value={taskForm.project}
            onChange={(e) => setTaskForm({ ...taskForm, project: e.target.value })}
            required
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </Input>
          <Input
            label="Description"
            as="textarea"
            rows={2}
            placeholder="Provide context or acceptance criteria..."
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Assignee"
              as="select"
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Input>
            <Input
              label="Priority"
              as="select"
              value={taskForm.priority}
              onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </Input>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmittingTask}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          isOpen={Boolean(selectedTaskId)}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => fetchDashboardData()}
          onTaskDeleted={() => {
            setSelectedTaskId(null);
            fetchDashboardData();
          }}
          users={users}
        />
      )}
    </div>
  );
};

export default Dashboard;

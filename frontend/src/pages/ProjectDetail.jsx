import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Users,
  Shield,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { projectAPI, taskAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import Button from '../components/Button';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import Input from '../components/Input';
import TaskDetailModal from '../components/TaskDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [users, setUsers] = useState([]);

  // Create Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
  });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projRes, userRes] = await Promise.all([
        projectAPI.getProjectById(id),
        userAPI.getUsers(),
      ]);

      if (projRes.data?.success) {
        setProjectData(projRes.data.project);
      }
      if (userRes.data?.success) {
        setUsers(userRes.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    try {
      setIsSubmittingTask(true);
      await taskAPI.createTask({
        ...taskForm,
        project: id,
      });
      setIsTaskModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'Medium',
        status: 'To Do',
        dueDate: '',
      });
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading project overview..." size="lg" />;
  }

  if (!projectData) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Project not found</h2>
        <Link to="/projects" className="text-sm text-brand-600 hover:underline mt-2 inline-block">
          &larr; Back to all projects
        </Link>
      </div>
    );
  }

  const { taskStats = {}, tasks = [], recentActivity = [] } = projectData;
  const progress = projectData.progress || 0;

  return (
    <div className="space-y-7">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </Link>

        <Button
          onClick={() => setIsTaskModalOpen(true)}
          size="sm"
          icon={Plus}
        >
          Add Task
        </Button>
      </div>

      {/* Project Overview Hero Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={projectData.status} />
              <PriorityBadge priority={projectData.priority} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {projectData.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {projectData.description || 'No project description provided.'}
            </p>
          </div>

          {/* Project Manager Card */}
          {projectData.manager && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3 shrink-0">
              <img
                src={
                  projectData.manager.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    projectData.manager.name
                  )}&background=3b82f6&color=fff`
                }
                alt={projectData.manager.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-500/20"
              />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Project Lead
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {projectData.manager.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {projectData.manager.email}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar & Schedule */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Completion Rate
              </span>
              <span className="font-extrabold text-brand-600 dark:text-brand-400">
                {progress}% ({taskStats.completed || 0}/{taskStats.total || 0} Finished)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400 md:justify-end">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Start</span>
              <span>
                {projectData.startDate
                  ? new Date(projectData.startDate).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Due Date</span>
              <span>
                {projectData.dueDate
                  ? new Date(projectData.dueDate).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Team Members ({projectData.members?.length || 0})
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {projectData.members?.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300"
              >
                <img
                  src={
                    member.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      member.name
                    )}&background=6366f1&color=fff`
                  }
                  alt={member.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-medium">{member.name}</span>
                <span className="text-[10px] text-slate-400 capitalize">({member.role})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Statistics Pill Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block">Total Tasks</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white">
            {taskStats.total || 0}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block">To Do</span>
          <span className="text-xl font-extrabold text-slate-700 dark:text-slate-300">
            {taskStats.todo || 0}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block">In Progress</span>
          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
            {taskStats.inProgress || 0}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block">Review</span>
          <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
            {taskStats.review || 0}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block">Completed</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {taskStats.completed || 0}
          </span>
        </div>
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 font-semibold block">Overdue</span>
          <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
            {taskStats.overdue || 0}
          </span>
        </div>
      </div>

      {/* Project Tasks Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Project Task Board ({tasks.length})
          </h2>
          <Button onClick={() => setIsTaskModalOpen(true)} size="sm" icon={Plus}>
            New Task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
            <p className="text-xs text-slate-500">No tasks created for this project yet.</p>
            <Button
              onClick={() => setIsTaskModalOpen(true)}
              size="sm"
              className="mt-3"
            >
              Add First Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                showProject={false}
                onClick={() => setSelectedTaskId(task._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Task to Project"
        subtitle={`Project: ${projectData.name}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Set up OAuth2 login flow"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />
          <Input
            label="Description"
            as="textarea"
            rows={2}
            placeholder="Describe deliverables and acceptance criteria..."
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
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTaskModalOpen(false)}
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
          onTaskUpdated={() => fetchProjectDetails()}
          onTaskDeleted={() => {
            setSelectedTaskId(null);
            fetchProjectDetails();
          }}
          users={users}
        />
      )}
    </div>
  );
};

export default ProjectDetail;

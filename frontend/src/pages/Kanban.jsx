import React, { useState, useEffect } from 'react';
import {
  Columns3,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { taskAPI, projectAPI, userAPI } from '../services/api';
import TaskCard from '../components/TaskCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import TaskDetailModal from '../components/TaskDetailModal';
import LoadingSpinner from '../components/LoadingSpinner';

const COLUMNS = [
  { id: 'To Do', title: 'TO DO', color: 'bg-slate-500', headerBg: 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300' },
  { id: 'In Progress', title: 'IN PROGRESS', color: 'bg-blue-500', headerBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' },
  { id: 'Review', title: 'REVIEW', color: 'bg-purple-500', headerBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' },
  { id: 'Completed', title: 'COMPLETED', color: 'bg-emerald-500', headerBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' },
];

const Kanban = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Drag and Drop active states
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropCol, setActiveDropCol] = useState(null);

  // Task Details Modal
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Quick Task Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState('To Do');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedProject) params.project = selectedProject;
      if (selectedPriority) params.priority = selectedPriority;

      const [taskRes, projRes, userRes] = await Promise.all([
        taskAPI.getTasks(params),
        projectAPI.getProjects(),
        userAPI.getUsers(),
      ]);

      if (taskRes.data?.success) {
        setTasks(taskRes.data.tasks || []);
      }
      if (projRes.data?.success) {
        setProjects(projRes.data.projects || []);
      }
      if (userRes.data?.success) {
        setUsers(userRes.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load Kanban data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanbanData();
  }, [selectedProject, selectedPriority]);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(task._id);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropCol !== columnId) {
      setActiveDropCol(columnId);
    }
  };

  const handleDragLeave = (columnId) => {
    if (activeDropCol === columnId) {
      setActiveDropCol(null);
    }
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setActiveDropCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;

    const taskToMove = tasks.find((t) => t._id === taskId);
    if (!taskToMove || taskToMove.status === targetStatus) return;

    // 1. Immediate Optimistic UI Update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
    );

    // 2. Persist update in MongoDB via backend API
    try {
      const res = await taskAPI.updateTask(taskId, { status: targetStatus });
      if (!res.data?.success) {
        // Rollback on failure
        setTasks(previousTasks);
      }
    } catch (err) {
      console.error('Failed to update task status on drop:', err);
      setTasks(previousTasks);
    }
  };

  const openCreateForColumn = (columnId) => {
    setCreateInitialStatus(columnId);
    setTaskForm({
      title: '',
      description: '',
      project: selectedProject || projects[0]?._id || '',
      assignedTo: '',
      priority: 'Medium',
      status: columnId,
      dueDate: '',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.project) {
      alert('Task title and project are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await taskAPI.createTask(taskForm);
      setIsCreateModalOpen(false);
      fetchKanbanData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Columns3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Interactive Kanban Board
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Drag and drop tasks between workflow stages to synchronize statuses in real-time
          </p>
        </div>

        {/* Project & Priority Filter dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none shadow-sm"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none shadow-sm"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <Button
            onClick={() => openCreateForColumn('To Do')}
            icon={Plus}
            size="sm"
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* 4-Column Board */}
      {loading ? (
        <LoadingSpinner label="Arranging Kanban columns..." size="lg" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.id);
            const isTargetCol = activeDropCol === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => handleDragLeave(col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`kanban-col flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 border transition-all duration-200 ${
                  isTargetCol
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-2 ring-brand-500/20 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div
                  className={`flex items-center justify-between p-3.5 rounded-t-2xl border-b border-slate-200/60 dark:border-slate-800/80 ${col.headerBg}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <h3 className="text-xs font-bold uppercase tracking-wider">
                      {col.title}
                    </h3>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => openCreateForColumn(col.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-900 transition-colors"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto min-h-[460px]">
                  {columnTasks.length === 0 ? (
                    <div
                      className={`h-36 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-center p-4 transition-colors ${
                        isTargetCol
                          ? 'border-brand-500 bg-brand-100/30 text-brand-600 dark:text-brand-400'
                          : 'border-slate-300 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      <p className="text-xs font-medium">
                        {isTargetCol ? 'Drop task here' : 'Drop cards here'}
                      </p>
                      <button
                        onClick={() => openCreateForColumn(col.id)}
                        className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline mt-1 font-semibold"
                      >
                        + Add task
                      </button>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        draggable={true}
                        onDragStart={handleDragStart}
                        onClick={() => setSelectedTaskId(task._id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Kanban Task"
        subtitle={`Initial Column: ${createInitialStatus}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Set up Redis pub/sub queue"
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
            placeholder="Outline task details..."
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
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Add to Board
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
          onTaskUpdated={() => fetchKanbanData()}
          onTaskDeleted={() => {
            setSelectedTaskId(null);
            fetchKanbanData();
          }}
          users={users}
        />
      )}
    </div>
  );
};

export default Kanban;

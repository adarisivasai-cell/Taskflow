import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, FolderKanban, SlidersHorizontal } from 'lucide-react';
import { projectAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Projects = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortOption, setSortOption] = useState('-createdAt');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Planning',
    manager: '',
    members: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (sortOption) params.sort = sortOption;

      const [projRes, userRes] = await Promise.all([
        projectAPI.getProjects(params),
        userAPI.getUsers(),
      ]);

      if (projRes.data?.success) {
        setProjects(projRes.data.projects || []);
      }
      if (userRes.data?.success) {
        setUsers(userRes.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter, priorityFilter, sortOption]);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      priority: 'Medium',
      status: 'Planning',
      manager: user?._id || '',
      members: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
      priority: project.priority || 'Medium',
      status: project.status || 'Planning',
      manager: project.manager?._id || project.manager || '',
      members: project.members ? project.members.map((m) => m._id || m) : [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingProject) {
        await projectAPI.updateProject(editingProject._id, formData);
      } else {
        await projectAPI.createProject(formData);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Are you sure you want to delete project "${project.name}" and all its tasks?`)) {
      return;
    }
    try {
      await projectAPI.deleteProject(project._id);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const exists = prev.members.includes(userId);
      return {
        ...prev,
        members: exists ? prev.members.filter((id) => id !== userId) : [...prev.members, userId],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Projects
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, track and deliver cross-functional engineering deliverables
          </p>
        </div>

        {isAdmin && (
          <Button onClick={handleOpenCreateModal} icon={Plus} size="sm">
            Create Project
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title or description..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          {/* Sorting */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="dueDate">Due Date (Earliest)</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner label="Loading projects..." size="lg" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            search || statusFilter || priorityFilter
              ? 'No projects match your filter criteria. Try clearing some filters.'
              : 'Get started by creating your first project.'
          }
          actionLabel={isAdmin ? 'Create Project' : null}
          onAction={isAdmin ? handleOpenCreateModal : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleOpenEditModal}
              onDelete={handleDelete}
              canManage={isAdmin || project.manager?._id === user?._id}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        subtitle={
          editingProject
            ? 'Update project details, assignees, and scheduling'
            : 'Initialize a new project and assign team resources'
        }
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Enterprise Security Compliance & SSO Audit"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Description"
            as="textarea"
            rows={3}
            placeholder="Provide context, mission objectives, and target outcomes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Priority"
              as="select"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </Input>

            <Input
              label="Status"
              as="select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </Input>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />

            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          {/* Project Manager */}
          <Input
            label="Project Manager"
            as="select"
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            required
          >
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role} - {u.department || 'Engineering'})
              </option>
            ))}
          </Input>

          {/* Assign Team Members */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assigned Team Members
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              {users.map((u) => {
                const isChecked = formData.members.includes(u._id);
                return (
                  <label
                    key={u._id}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleMemberToggle(u._id)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <img
                      src={
                        u.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          u.name
                        )}&background=6366f1&color=fff`
                      }
                      alt={u.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="truncate">{u.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              {editingProject ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;

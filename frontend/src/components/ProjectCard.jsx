import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Users } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const ProjectCard = ({ project, onEdit, onDelete, canManage = false }) => {
  const progress = project.progress || 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={project.status} size="xs" />
            <PriorityBadge priority={project.priority} size="xs" />
          </div>
          {canManage && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(project);
                  }}
                  className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors text-xs"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(project);
                  }}
                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors text-xs"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Title & Link */}
        <Link to={`/projects/${project._id}`} className="block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-1.5">
            {project.name}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {project.description || 'No description provided.'}
          </p>
        </Link>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress === 100
                  ? 'bg-emerald-500'
                  : progress > 50
                  ? 'bg-brand-600 dark:bg-brand-500'
                  : 'bg-indigo-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks & Due Date */}
        <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              <strong>{project.completedTasks || 0}</strong>/{project.totalTasks || 0} Tasks
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 justify-end">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{formatDate(project.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Footer: Manager & Team Members Avatars */}
      <div className="flex items-center justify-between pt-3 mt-1 text-xs">
        <div className="flex items-center gap-2">
          {project.manager && (
            <div className="flex items-center gap-1.5" title={`Manager: ${project.manager.name}`}>
              <img
                src={
                  project.manager.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    project.manager.name
                  )}&background=3b82f6&color=fff`
                }
                alt={project.manager.name}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
              />
              <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate max-w-[85px]">
                {project.manager.name.split(' ')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Team Members stack */}
        {project.members && project.members.length > 0 && (
          <div className="flex -space-x-1.5 overflow-hidden">
            {project.members.slice(0, 3).map((member) => (
              <img
                key={member._id}
                src={
                  member.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    member.name
                  )}&background=6366f1&color=fff`
                }
                alt={member.name}
                title={member.name}
                className="inline-block w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
              />
            ))}
            {project.members.length > 3 && (
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold ring-2 ring-white dark:ring-slate-900">
                +{project.members.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;

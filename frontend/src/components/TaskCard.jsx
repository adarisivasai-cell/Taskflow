import React from 'react';
import { Calendar, MessageSquare, AlertCircle, GripVertical } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

const TaskCard = ({
  task,
  onClick,
  onDragStart,
  draggable = false,
  showProject = true,
}) => {
  const isOverdue =
    Boolean(task.dueDate) &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'Completed';

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        if (draggable && onDragStart) {
          onDragStart(e, task);
        }
      }}
      onClick={onClick}
      className="group relative bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-pointer select-none"
    >
      {/* Top Meta: Project & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {draggable && (
            <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0" />
          )}
          {showProject && task.project && (
            <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded truncate max-w-[140px]">
              {task.project.name || 'Project'}
            </span>
          )}
        </div>
        <PriorityBadge priority={task.priority} size="xs" />
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 mb-2">
        {task.title}
      </h4>

      {/* Description Snippet if present */}
      {task.description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Bottom Row: Due date, comments, assignee */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          {task.dueDate && (
            <div
              className={`flex items-center gap-1 ${
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title={isOverdue ? 'Overdue!' : 'Due date'}
            >
              {isOverdue ? (
                <AlertCircle className="w-3.5 h-3.5" />
              ) : (
                <Calendar className="w-3.5 h-3.5" />
              )}
              <span className="text-[11px]">{formatDueDate(task.dueDate)}</span>
            </div>
          )}

          {(task.commentCount > 0 || (task.comments && task.comments.length > 0)) && (
            <div className="flex items-center gap-1 text-[11px]">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task.commentCount || task.comments?.length || 0}</span>
            </div>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignedTo ? (
          <div className="flex items-center gap-1.5" title={task.assignedTo.name}>
            <img
              src={
                task.assignedTo.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  task.assignedTo.name
                )}&background=6366f1&color=fff`
              }
              alt={task.assignedTo.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-white dark:ring-slate-900"
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:inline max-w-[80px] truncate">
              {task.assignedTo.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 italic">Unassigned</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

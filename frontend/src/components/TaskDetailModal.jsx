import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Send, Clock, User, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { taskAPI, commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TaskDetailModal = ({
  taskId,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
  users = [],
}) => {
  const { user: currentUser, isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load task details & comments
  const loadTask = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await taskAPI.getTaskById(taskId);
      if (res.data?.success) {
        setTask(res.data.task);
      }
    } catch (err) {
      console.error('Failed to load task details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      loadTask();
    }
  }, [taskId, isOpen]);

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      const res = await taskAPI.updateTask(task._id, { status: newStatus });
      if (res.data?.success) {
        setTask((prev) => ({ ...prev, status: newStatus }));
        if (onTaskUpdated) onTaskUpdated(res.data.task);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle priority change
  const handlePriorityChange = async (newPriority) => {
    try {
      setIsUpdating(true);
      const res = await taskAPI.updateTask(task._id, { priority: newPriority });
      if (res.data?.success) {
        setTask((prev) => ({ ...prev, priority: newPriority }));
        if (onTaskUpdated) onTaskUpdated(res.data.task);
      }
    } catch (err) {
      console.error('Failed to update priority:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle assignee change
  const handleAssigneeChange = async (newUserId) => {
    try {
      setIsUpdating(true);
      const res = await taskAPI.updateTask(task._id, {
        assignedTo: newUserId || null,
      });
      if (res.data?.success) {
        const found = users.find((u) => u._id === newUserId);
        setTask((prev) => ({ ...prev, assignedTo: found || null }));
        if (onTaskUpdated) onTaskUpdated(res.data.task);
      }
    } catch (err) {
      console.error('Failed to update assignee:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const res = await commentAPI.addComment(task._id, newComment.trim());
      if (res.data?.success) {
        setTask((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data.comment],
          commentCount: (prev.commentCount || 0) + 1,
        }));
        setNewComment('');
        if (onTaskUpdated) onTaskUpdated();
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      setTask((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== commentId),
        commentCount: Math.max(0, (prev.commentCount || 1) - 1),
      }));
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) return;
    try {
      await taskAPI.deleteTask(task._id);
      if (onTaskDeleted) onTaskDeleted(task._id);
      onClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const formatCommentDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!task && loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
        <div className="py-12 text-center text-slate-500">Loading task details...</div>
      </Modal>
    );
  }

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Header Badges & Actions */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2.5 py-1 rounded-md">
              {task.project?.name || 'Project'}
            </span>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteTask}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
        </div>

        {/* Task Title & Description */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {task.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {task.description || <span className="italic text-slate-400">No description provided.</span>}
          </p>
        </div>

        {/* Task Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs">
          {/* Status Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Status</label>
            <select
              value={task.status}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Review">Review</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Priority</label>
            <select
              value={task.priority}
              disabled={isUpdating}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Assignee Selector */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Assignee</label>
            <select
              value={task.assignedTo?._id || task.assignedTo || ''}
              disabled={isUpdating}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 dark:text-slate-200"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date & Creation dates */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Activity & Discussion ({task.comments?.length || 0})
          </h4>

          {/* Comments List */}
          <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
            {!task.comments || task.comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation!</p>
            ) : (
              task.comments.map((comment) => {
                const canDelete =
                  currentUser?._id === comment.user?._id ||
                  currentUser?._id === comment.user ||
                  isAdmin;

                return (
                  <div
                    key={comment._id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <img
                      src={
                        comment.user?.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          comment.user?.name || 'User'
                        )}&background=6366f1&color=fff`
                      }
                      alt={comment.user?.name || 'User'}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {comment.user?.name || 'User'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            {formatCommentDate(comment.createdAt)}
                          </span>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-0.5"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2 items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingComment}
              disabled={!newComment.trim()}
              icon={Send}
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;

import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { createNotification } from '../utils/notificationHelper.js';

// @desc    Get comments for a specific task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
export const getCommentsByTask = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('user', 'name email avatar role department')
      .sort('createdAt');

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:taskId/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = await Comment.create({
      task: task._id,
      user: req.user._id,
      content: content.trim(),
    });

    const populated = await Comment.findById(comment._id).populate('user', 'name email avatar role department');

    // Notify task assignee if different from commenter
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        user: task.assignedTo,
        type: 'comment_added',
        message: `${req.user.name} commented on "${task.title}": "${content.slice(0, 40)}${content.length > 40 ? '...' : ''}"`,
        relatedTask: task._id,
        relatedProject: task.project,
      });
    }

    res.status(201).json({
      success: true,
      comment: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Only author or Admin can delete
    const isAuthor = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to delete your own comments',
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

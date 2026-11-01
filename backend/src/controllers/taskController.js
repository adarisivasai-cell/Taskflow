import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Comment from '../models/Comment.js';
import { createNotification } from '../utils/notificationHelper.js';

// Priority sorting helper
const priorityWeight = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

// @desc    Get all tasks with extensive search, filters, and sorting
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const {
      project,
      assignedTo,
      status,
      priority,
      search,
      overdue,
      myTasks,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (project) query.project = project;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (assignedTo) {
      query.assignedTo = assignedTo;
    } else if (myTasks === 'true') {
      query.assignedTo = req.user._id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $ne: 'Completed' };
    }

    let sortOption = {};
    if (sort === 'newest' || sort === '-createdAt') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest' || sort === 'createdAt') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'dueDate') {
      sortOption = { dueDate: 1 };
    } else if (sort === '-dueDate') {
      sortOption = { dueDate: -1 };
    } else {
      sortOption = { position: 1, createdAt: -1 };
    }

    let tasks = await Task.find(query)
      .populate('project', 'name status priority')
      .populate('assignedTo', 'name email avatar department role')
      .sort(sortOption);

    // If sorting by priority
    if (sort === 'priority-high') {
      tasks = tasks.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
    } else if (sort === 'priority-low') {
      tasks = tasks.sort((a, b) => (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0));
    }

    // Attach comment counts
    const taskIds = tasks.map((t) => t._id);
    const commentCounts = await Comment.aggregate([
      { $match: { task: { $in: taskIds } } },
      { $group: { _id: '$task', count: { $sum: 1 } } },
    ]);

    const countMap = {};
    commentCounts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const tasksWithExtras = tasks.map((task) => ({
      ...task.toObject(),
      commentCount: countMap[task._id.toString()] || 0,
      isOverdue:
        Boolean(task.dueDate) &&
        new Date(task.dueDate) < new Date() &&
        task.status !== 'Completed',
    }));

    res.status(200).json({
      success: true,
      count: tasksWithExtras.length,
      tasks: tasksWithExtras,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single task by ID with comments
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status priority manager members')
      .populate('assignedTo', 'name email avatar department role');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comments = await Comment.find({ task: task._id })
      .populate('user', 'name email avatar role')
      .sort('createdAt');

    const isOverdue =
      Boolean(task.dueDate) &&
      new Date(task.dueDate) < new Date() &&
      task.status !== 'Completed';

    res.status(200).json({
      success: true,
      task: {
        ...task.toObject(),
        comments,
        commentCount: comments.length,
        isOverdue,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, priority, status, dueDate, position } = req.body;

    if (!title || !project) {
      return res.status(400).json({
        success: false,
        message: 'Task title and project reference are required',
      });
    }

    const parentProject = await Project.findById(project);
    if (!parentProject) {
      return res.status(404).json({ success: false, message: 'Referenced project does not exist' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || '',
      project,
      assignedTo: assignedTo || null,
      priority: priority || 'Medium',
      status: status || 'To Do',
      dueDate: dueDate || null,
      position: position !== undefined ? position : 0,
    });

    // Notify assigned user if different from creator
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        user: assignedTo,
        type: 'task_assigned',
        message: `${req.user.name} assigned you the task "${task.title}" in project "${parentProject.name}"`,
        relatedTask: task._id,
        relatedProject: parentProject._id,
      });
    }

    const populated = await Task.findById(task._id)
      .populate('project', 'name status priority')
      .populate('assignedTo', 'name email avatar department role');

    res.status(201).json({
      success: true,
      task: {
        ...populated.toObject(),
        commentCount: 0,
        isOverdue: Boolean(task.dueDate) && new Date(task.dueDate) < new Date() && task.status !== 'Completed',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update task details or status/position (Kanban support)
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignedTo?.toString();

    const fields = ['title', 'description', 'project', 'assignedTo', 'priority', 'status', 'dueDate', 'position'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field] === '' ? null : req.body[field];
      }
    });

    await task.save();

    const parentProject = await Project.findById(task.project);

    // 1. Notify newly assigned user
    if (task.assignedTo && task.assignedTo.toString() !== oldAssignee && task.assignedTo.toString() !== req.user._id.toString()) {
      await createNotification({
        user: task.assignedTo,
        type: 'task_assigned',
        message: `${req.user.name} assigned you the task "${task.title}"`,
        relatedTask: task._id,
        relatedProject: parentProject?._id,
      });
    }

    // 2. Notify if status changed
    if (req.body.status && req.body.status !== oldStatus) {
      // Notify assignee if not the updater
      if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
        await createNotification({
          user: task.assignedTo,
          type: 'status_changed',
          message: `Task "${task.title}" status changed to ${task.status} by ${req.user.name}`,
          relatedTask: task._id,
          relatedProject: parentProject?._id,
        });
      }
      // Also notify project manager if different
      if (parentProject && parentProject.manager.toString() !== req.user._id.toString() && parentProject.manager.toString() !== task.assignedTo?.toString()) {
        await createNotification({
          user: parentProject.manager,
          type: 'status_changed',
          message: `Task "${task.title}" status updated to ${task.status}`,
          relatedTask: task._id,
          relatedProject: parentProject._id,
        });
      }
    }

    const populated = await Task.findById(task._id)
      .populate('project', 'name status priority')
      .populate('assignedTo', 'name email avatar department role');

    const commentCount = await Comment.countDocuments({ task: task._id });

    res.status(200).json({
      success: true,
      task: {
        ...populated.toObject(),
        commentCount,
        isOverdue: Boolean(task.dueDate) && new Date(task.dueDate) < new Date() && task.status !== 'Completed',
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Delete associated comments
    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(task._id);

    res.status(200).json({
      success: true,
      message: 'Task and related comments deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

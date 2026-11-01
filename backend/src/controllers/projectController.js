import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import { createNotification } from '../utils/notificationHelper.js';

// Helper to calculate progress percentage for a project
const calculateProjectProgress = async (projectId) => {
  const totalTasks = await Task.countDocuments({ project: projectId });
  if (totalTasks === 0) return { progress: 0, totalTasks: 0, completedTasks: 0 };

  const completedTasks = await Task.countDocuments({ project: projectId, status: 'Completed' });
  const progress = Math.round((completedTasks / totalTasks) * 100);
  return { progress, totalTasks, completedTasks };
};

// @desc    Get all projects with filters and progress
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    const { status, priority, manager, search, sort = '-createdAt' } = req.query;
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (manager) query.manager = manager;

    // Role-based visibility:
    // If Member, they can view projects where they are manager or member, or all projects if unassigned
    // In TaskFlow, let Members see projects they are part of, or all projects if admin
    if (req.user.role !== 'Admin') {
      // By default show projects the member belongs to, or all public team projects
      // We allow members to view all projects or filter by their participation
      if (req.query.myProjects === 'true') {
        query.$or = [{ manager: req.user._id }, { members: req.user._id }];
      }
    }

    const projects = await Project.find(query)
      .populate('manager', 'name email avatar role')
      .populate('members', 'name email avatar role')
      .sort(sort);

    // Compute progress and task breakdown for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const stats = await calculateProjectProgress(project._id);
        const pendingTasks = await Task.countDocuments({
          project: project._id,
          status: { $in: ['To Do', 'In Progress', 'Review'] },
        });

        return {
          ...project.toObject(),
          progress: stats.progress,
          totalTasks: stats.totalTasks,
          completedTasks: stats.completedTasks,
          pendingTasks,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithProgress.length,
      projects: projectsWithProgress,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single project by ID with full tasks, stats, and activity
// @route   GET /api/projects/:id
// @access  Private
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email avatar role department')
      .populate('members', 'name email avatar role department');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Get all tasks for this project
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email avatar role')
      .sort('position createdAt');

    // Calculate detailed task stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
    const reviewTasks = tasks.filter((t) => t.status === 'Review').length;
    const todoTasks = tasks.filter((t) => t.status === 'To Do').length;

    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Completed'
    ).length;

    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Get recent activity (recent task comments and updates)
    const taskIds = tasks.map((t) => t._id);
    const recentComments = await Comment.find({ task: { $in: taskIds } })
      .populate('user', 'name avatar')
      .populate('task', 'title')
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      project: {
        ...project.toObject(),
        progress,
        taskStats: {
          total: totalTasks,
          todo: todoTasks,
          inProgress: inProgressTasks,
          review: reviewTasks,
          completed: completedTasks,
          overdue: overdueTasks,
        },
        tasks,
        recentActivity: recentComments,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin or Manager)
export const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, dueDate, priority, status, manager, members } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    // Assign current user if not provided, or provided manager if admin
    const projectManager = manager || req.user._id;

    const project = await Project.create({
      name: name.trim(),
      description: description || '',
      startDate: startDate || new Date(),
      dueDate,
      priority: priority || 'Medium',
      status: status || 'Planning',
      manager: projectManager,
      members: members || [],
    });

    // Notify assigned members
    if (members && Array.isArray(members) && members.length > 0) {
      for (const memberId of members) {
        if (memberId.toString() !== req.user._id.toString()) {
          await createNotification({
            user: memberId,
            type: 'project_assigned',
            message: `You were added to the project "${project.name}" by ${req.user.name}`,
            relatedProject: project._id,
          });
        }
      }
    }

    const populated = await Project.findById(project._id)
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(201).json({
      success: true,
      project: {
        ...populated.toObject(),
        progress: 0,
        totalTasks: 0,
        completedTasks: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Only Admin or the project manager can update project settings
    const isManager = project.manager.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the project manager or an Admin can edit project details',
      });
    }

    const oldMembers = project.members.map((m) => m.toString());

    // Update allowed fields
    const fields = ['name', 'description', 'startDate', 'dueDate', 'priority', 'status', 'manager', 'members'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();

    // Check newly added members to notify
    if (req.body.members && Array.isArray(req.body.members)) {
      const newMembers = req.body.members.filter((m) => !oldMembers.includes(m.toString()));
      for (const memberId of newMembers) {
        if (memberId.toString() !== req.user._id.toString()) {
          await createNotification({
            user: memberId,
            type: 'project_assigned',
            message: `You were added to project "${project.name}"`,
            relatedProject: project._id,
          });
        }
      }
    }

    const updated = await Project.findById(project._id)
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar');

    const stats = await calculateProjectProgress(project._id);

    res.status(200).json({
      success: true,
      project: {
        ...updated.toObject(),
        progress: stats.progress,
        totalTasks: stats.totalTasks,
        completedTasks: stats.completedTasks,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin or Project Manager)
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isManager = project.manager.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'Admin';

    if (!isManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only an Admin or the project manager can delete this project',
      });
    }

    // Find all tasks of this project to delete associated comments
    const tasks = await Task.find({ project: project._id });
    const taskIds = tasks.map((t) => t._id);

    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

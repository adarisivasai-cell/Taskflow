import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import User from '../models/User.js';

// @desc    Get dashboard metrics, charts data and recent activities
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const isMember = req.user.role !== 'Admin';
    const now = new Date();

    // Project filters
    const projectFilter = isMember && req.query.personal === 'true'
      ? { $or: [{ manager: req.user._id }, { members: req.user._id }] }
      : {};

    // Task filters
    const taskFilter = isMember && req.query.personal === 'true'
      ? { assignedTo: req.user._id }
      : {};

    // Parallel count queries
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      planningProjects,
      onHoldProjects,
      totalTasks,
      todoTasks,
      inProgressTasks,
      reviewTasks,
      completedTasks,
      overdueTasks,
      totalUsers,
    ] = await Promise.all([
      Project.countDocuments(projectFilter),
      Project.countDocuments({ ...projectFilter, status: 'Active' }),
      Project.countDocuments({ ...projectFilter, status: 'Completed' }),
      Project.countDocuments({ ...projectFilter, status: 'Planning' }),
      Project.countDocuments({ ...projectFilter, status: 'On Hold' }),
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'To Do' }),
      Task.countDocuments({ ...taskFilter, status: 'In Progress' }),
      Task.countDocuments({ ...taskFilter, status: 'Review' }),
      Task.countDocuments({ ...taskFilter, status: 'Completed' }),
      Task.countDocuments({
        ...taskFilter,
        dueDate: { $lt: now },
        status: { $ne: 'Completed' },
      }),
      User.countDocuments(),
    ]);

    // Priority breakdown
    const priorityBreakdown = {
      Urgent: await Task.countDocuments({ ...taskFilter, priority: 'Urgent' }),
      High: await Task.countDocuments({ ...taskFilter, priority: 'High' }),
      Medium: await Task.countDocuments({ ...taskFilter, priority: 'Medium' }),
      Low: await Task.countDocuments({ ...taskFilter, priority: 'Low' }),
    };

    // Calculate overall completion rate
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Recent activity aggregation:
    // 1. Recent tasks created or updated
    const recentTasks = await Task.find(taskFilter)
      .populate('project', 'name')
      .populate('assignedTo', 'name avatar')
      .sort('-updatedAt')
      .limit(6);

    // 2. Recent comments
    const recentComments = await Comment.find()
      .populate('user', 'name avatar role')
      .populate('task', 'title')
      .sort('-createdAt')
      .limit(5);

    // 3. Recent projects
    const recentProjects = await Project.find(projectFilter)
      .populate('manager', 'name avatar')
      .sort('-createdAt')
      .limit(5);

    // Build unified recent activities
    const activities = [];

    recentTasks.forEach((t) => {
      activities.push({
        id: `task-${t._id}`,
        type: t.status === 'Completed' ? 'task_completed' : 'task_updated',
        title: t.title,
        status: t.status,
        project: t.project?.name || 'Project',
        user: t.assignedTo?.name || 'Unassigned',
        avatar: t.assignedTo?.avatar || '',
        timestamp: t.updatedAt,
      });
    });

    recentComments.forEach((c) => {
      activities.push({
        id: `comment-${c._id}`,
        type: 'comment_added',
        title: `Comment on "${c.task?.title || 'Task'}"`,
        content: c.content,
        user: c.user?.name || 'User',
        avatar: c.user?.avatar || '',
        timestamp: c.createdAt,
      });
    });

    recentProjects.forEach((p) => {
      activities.push({
        id: `proj-${p._id}`,
        type: 'project_created',
        title: p.name,
        status: p.status,
        user: p.manager?.name || 'Manager',
        avatar: p.manager?.avatar || '',
        timestamp: p.createdAt,
      });
    });

    // Sort combined activities by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      stats: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          planning: planningProjects,
          onHold: onHoldProjects,
        },
        tasks: {
          total: totalTasks,
          pending: todoTasks,
          inProgress: inProgressTasks,
          review: reviewTasks,
          completed: completedTasks,
          overdue: overdueTasks,
        },
        completionRate,
        totalUsers,
        priorityBreakdown,
      },
      recentActivity: activities.slice(0, 10),
      recentProjects,
    });
  } catch (err) {
    next(err);
  }
};

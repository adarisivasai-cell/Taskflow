import User from '../models/User.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get all users (with search and role filter)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const { search, role, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && ['Admin', 'Member'].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query).sort(sort).select('-password');

    // Attach task count stats for each user (for team/admin views)
    const userStats = await Promise.all(
      users.map(async (user) => {
        const totalAssignedTasks = await Task.countDocuments({ assignedTo: user._id });
        const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: 'Completed' });
        const pendingTasks = totalAssignedTasks - completedTasks;
        const activeProjects = await Project.countDocuments({
          $or: [{ manager: user._id }, { members: user._id }],
          status: { $in: ['Active', 'Planning'] },
        });

        return {
          ...user.toObject(),
          totalAssignedTasks,
          completedTasks,
          pendingTasks,
          activeProjects,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: userStats.length,
      users: userStats,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user by ID with workload details
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const assignedTasks = await Task.find({ assignedTo: user._id }).populate('project', 'name status');
    const completedTasksCount = assignedTasks.filter((t) => t.status === 'Completed').length;
    const activeProjects = await Project.find({
      $or: [{ manager: user._id }, { members: user._id }],
    });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        totalTasks: assignedTasks.length,
        completedTasks: completedTasksCount,
        pendingTasks: assignedTasks.length - completedTasksCount,
        assignedTasks,
        projects: activeProjects,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=3b82f6&color=ffffff&bold=true`;

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'Member',
      department: department || 'Engineering',
      avatar: defaultAvatar,
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile or user details
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Authorization: User can update their own profile, or Admin can update anyone
    const isSelf = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'Admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this user',
      });
    }

    const { name, bio, department, avatar, role, password } = req.body;

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (department !== undefined) user.department = department;
    if (avatar) user.avatar = avatar;

    // Only admin can change roles
    if (role && isAdmin) {
      if (['Admin', 'Member'].includes(role)) {
        user.role = role;
      }
    }

    // If password provided and user is updating own password
    if (password && isSelf) {
      user.password = password;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting self
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot delete their own active account',
      });
    }

    // Unassign tasks from this user
    await Task.updateMany({ assignedTo: user._id }, { $unset: { assignedTo: '' } });

    // Remove user from project teams
    await Project.updateMany({ members: user._id }, { $pull: { members: user._id } });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully and related tasks unassigned',
    });
  } catch (err) {
    next(err);
  }
};

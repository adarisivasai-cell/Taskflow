import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Cleaning old collection data...');
    await Promise.all([
      User.deleteMany(),
      Project.deleteMany(),
      Task.deleteMany(),
      Comment.deleteMany(),
      Notification.deleteMany(),
    ]);

    console.log('[Seed] Inserting users...');
    // Demo users required by specification
    const admin = await User.create({
      name: 'Elena Rostova',
      email: 'admin@taskflow.com',
      password: 'admin123',
      role: 'Admin',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Head of Product Operations and Full-Stack Engineering Manager.',
      department: 'Executive Engineering',
    });

    const member1 = await User.create({
      name: 'Marcus Chen',
      email: 'member@taskflow.com',
      password: 'member123',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Senior Frontend Engineer focusing on React, animations, and high-performance UX.',
      department: 'Frontend Engineering',
    });

    const member2 = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.j@taskflow.com',
      password: 'password123',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Cloud Architect & Backend Specialist with focus on Node.js and MongoDB.',
      department: 'Platform Architecture',
    });

    const member3 = await User.create({
      name: 'Alex Rivera',
      email: 'alex.r@taskflow.com',
      password: 'password123',
      role: 'Member',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Lead Product Designer obsessed with design systems, dark modes, and microinteractions.',
      department: 'Product Design',
    });

    console.log('[Seed] Creating realistic projects...');
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const project1 = await Project.create({
      name: 'CloudScale 2.0 Infrastructure Migration',
      description: 'Migrating legacy monolith services to highly scalable microservices architecture with automated CI/CD pipelines.',
      startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      dueDate: nextMonth,
      priority: 'Critical',
      status: 'Active',
      manager: admin._id,
      members: [admin._id, member1._id, member2._id],
    });

    const project2 = await Project.create({
      name: 'Mobile App Redesign & Design System',
      description: 'Refreshing our customer-facing mobile and desktop applications with modern responsive design guidelines and dark mode support.',
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      dueDate: nextWeek,
      priority: 'High',
      status: 'Active',
      manager: admin._id,
      members: [member1._id, member3._id],
    });

    const project3 = await Project.create({
      name: 'Enterprise Security Compliance & SSO Audit',
      description: 'Implementing SOC2 compliance, OAuth2 / SAML SSO integration, and role-based access control audits.',
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      dueDate: lastWeek,
      priority: 'Medium',
      status: 'Completed',
      manager: admin._id,
      members: [admin._id, member2._id],
    });

    const project4 = await Project.create({
      name: 'AI-Powered Predictive Analytics Engine',
      description: 'Researching and prototyping predictive customer churn models and automated resource allocation.',
      startDate: new Date(),
      dueDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      priority: 'Low',
      status: 'Planning',
      manager: member1._id,
      members: [member1._id, member2._id, member3._id],
    });

    console.log('[Seed] Creating tasks across Kanban stages...');
    // Project 1 Tasks
    const task1 = await Task.create({
      title: 'Configure Docker multi-stage build & production containers',
      description: 'Optimize image sizes by decoupling build dependencies and setting up non-root user permissions.',
      project: project1._id,
      assignedTo: member2._id,
      priority: 'High',
      status: 'Completed',
      dueDate: lastWeek,
      position: 0,
    });

    const task2 = await Task.create({
      title: 'Implement JWT authentication with refresh token rotation',
      description: 'Secure API endpoints with bcrypt password hashing and token verification middlewares.',
      project: project1._id,
      assignedTo: member1._id,
      priority: 'Urgent',
      status: 'In Progress',
      dueDate: nextWeek,
      position: 1,
    });

    const task3 = await Task.create({
      title: 'Database connection pooling and index optimization',
      description: 'Verify MongoDB compound indices on Task and Project collections for sub-10ms response times.',
      project: project1._id,
      assignedTo: member2._id,
      priority: 'Medium',
      status: 'Review',
      dueDate: nextWeek,
      position: 2,
    });

    const task4 = await Task.create({
      title: 'Set up Prometheus & Grafana application metrics',
      description: 'Expose /metrics endpoint with response duration, error count, and memory allocation gauges.',
      project: project1._id,
      assignedTo: member1._id,
      priority: 'Low',
      status: 'To Do',
      dueDate: nextMonth,
      position: 3,
    });

    // Project 2 Tasks (Mobile App Redesign)
    const task5 = await Task.create({
      title: 'Create unified Figma tokens for typography and dark mode palettes',
      description: 'Establish semantic color tokens for surface, border, and brand colors compatible with Tailwind CSS.',
      project: project2._id,
      assignedTo: member3._id,
      priority: 'High',
      status: 'Completed',
      dueDate: lastWeek,
      position: 0,
    });

    const task6 = await Task.create({
      title: 'Build drag-and-drop Kanban board layout',
      description: 'Ensure smooth card movement between columns with optimistic UI feedback and backend synchronization.',
      project: project2._id,
      assignedTo: member1._id,
      priority: 'Urgent',
      status: 'In Progress',
      dueDate: nextWeek,
      position: 1,
    });

    const task7 = await Task.create({
      title: 'Mobile touch gesture handlers for sidebar navigation',
      description: 'Enable swipe-to-close drawer for mobile devices and small tablets.',
      project: project2._id,
      assignedTo: member3._id,
      priority: 'Medium',
      status: 'To Do',
      dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Overdue intentionally for demo
      position: 2,
    });

    const task8 = await Task.create({
      title: 'Accessibility audit for WCAG 2.1 AA compliance',
      description: 'Verify color contrast ratios, screen reader aria-labels, and full keyboard navigation in forms.',
      project: project2._id,
      assignedTo: member3._id,
      priority: 'Low',
      status: 'Review',
      dueDate: nextWeek,
      position: 3,
    });

    // Project 3 Tasks (Completed)
    await Task.create({
      title: 'Complete SOC2 Type 1 audit questionnaire',
      description: 'Document password policies, encryption at rest, and access control audit trails.',
      project: project3._id,
      assignedTo: member2._id,
      priority: 'Urgent',
      status: 'Completed',
      dueDate: lastWeek,
      position: 0,
    });

    console.log('[Seed] Adding realistic comments...');
    await Comment.create({
      task: task2._id,
      user: admin._id,
      content: 'Make sure we store the JWT in authorization headers and avoid storing sensitive tokens in localStorage insecurely.',
    });

    await Comment.create({
      task: task2._id,
      user: member1._id,
      content: 'Understood Elena! The bearer token strategy is in place with axios interceptors handling unauthorized 401 redirects.',
    });

    await Comment.create({
      task: task6._id,
      user: member3._id,
      content: 'I verified the drag feedback visually. The blue drop indicator looks crisp in both light and dark themes!',
    });

    console.log('[Seed] Adding notifications for users...');
    await Notification.create({
      user: member1._id,
      type: 'task_assigned',
      message: `${admin.name} assigned you the task "Implement JWT authentication with refresh token rotation"`,
      relatedTask: task2._id,
      relatedProject: project1._id,
      read: false,
    });

    await Notification.create({
      user: member1._id,
      type: 'comment_added',
      message: `${admin.name} commented on your task "Implement JWT authentication"`,
      relatedTask: task2._id,
      relatedProject: project1._id,
      read: false,
    });

    await Notification.create({
      user: member3._id,
      type: 'task_overdue',
      message: 'Task "Mobile touch gesture handlers for sidebar navigation" is overdue',
      relatedTask: task7._id,
      relatedProject: project2._id,
      read: false,
    });

    await Notification.create({
      user: admin._id,
      type: 'project_assigned',
      message: 'New project "CloudScale 2.0 Infrastructure Migration" was initialized',
      relatedProject: project1._id,
      read: true,
    });

    console.log('✅ [Seed] Database seeded successfully with demo data!');
    console.log('----------------------------------------------------');
    console.log('Credentials:');
    console.log('Admin:  admin@taskflow.com  / admin123');
    console.log('Member: member@taskflow.com / member123');
    console.log('----------------------------------------------------');
  } catch (err) {
    console.error('❌ [Seed Error]:', err);
    throw err;
  }
};

// If run directly from command line
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  })();
}

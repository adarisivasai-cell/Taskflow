# TaskFlow — Full-Stack Project Management Platform

> A production-ready, commercial-grade Full-Stack Project Management SaaS platform built to demonstrate end-to-end full-stack software engineering concepts across all 4 internship course modules: **Frontend Foundations**, **React.js**, **Node.js & Express REST APIs**, and **MongoDB Databases & Production Deployment**.

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Technology Stack](#-technology-stack)
4. [System Architecture](#-system-architecture)
5. [Folder Structure](#-folder-structure)
6. [Database Design & Schemas](#-database-design--schemas)
7. [REST API Documentation](#-rest-api-documentation)
8. [Installation & Setup](#-installation--setup)
9. [Environment Variables](#-environment-variables)
10. [How to Run the Application](#-how-to-run-the-application)
11. [Database Seeding](#-database-seeding)
12. [Demo Login Credentials](#-demo-login-credentials)
13. [Deployment Guide](#-deployment-guide)
14. [Testing Checklist](#-testing-checklist)
15. [Course Module Mapping](#-course-module-mapping-for-internship-evaluations)
16. [Future Enhancements](#-future-enhancements)

---

## 🌟 Project Overview

**TaskFlow** is an enterprise-grade project and team management platform inspired by tools like Trello and Asana. It provides engineering teams with an intuitive workflow dashboard, interactive drag-and-drop Kanban boards, granular role-based authorization (Admin & Member), real-time notifications, workload distribution analytics, and collaborative task discussion threads.

The project strictly adheres to clean code architecture, separation of concerns, and security best practices:
- Passwords hashed with **bcryptjs** (10 salt rounds)
- Stateless authentication with **JSON Web Tokens (JWT)**
- Centralized error handling and Mongoose schema validations
- Optimistic UI updates with instant persistence to MongoDB
- Full responsiveness on mobile, tablet, and widescreen desktop displays
- Automatic light and dark theme switching persisted in `localStorage`

---

## 🚀 Key Features

### 1. Authentication & Security
- **JWT-Based Authentication**: Secure Bearer tokens with automatic expiration and refresh redirection.
- **Bcrypt Password Encryption**: Industry-standard hashing prior to storage.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Create/delete projects, manage system users, promote/demote user roles, assign members, and view organization-wide metrics.
  - **Member**: Access assigned projects, manage assigned tasks, adjust statuses, and participate in discussion threads.
- **Quick Demo Login Buttons**: One-click authentication as Admin or Member directly from the login page.

### 2. Executive Dashboard
- **Live Statistics Cards**: Total Projects, Active Projects, Completed Projects, Total Tasks, In Progress Tasks, Completed Tasks, and Overdue Tasks.
- **Sprint Completion Meter**: Dynamically calculated percentage progress bar.
- **Priority Matrix**: Visual breakdown of Urgent, High, Medium, and Low deliverables.
- **Live Activity Feed**: Aggregated stream of task creations, updates, completions, and discussions.

### 3. Project Management
- Full CRUD operations with auto-calculated progress percentage: `(completedTasks / totalTasks) * 100`.
- Project health metrics: Start dates, target due dates, priority tiers (`Low`, `Medium`, `High`, `Critical`), and status stages (`Planning`, `Active`, `On Hold`, `Completed`).
- Manager and team member multi-assignment with stacked avatars.

### 4. Interactive Drag-and-Drop Kanban Board
- Four agile workflow columns: **TO DO**, **IN PROGRESS**, **REVIEW**, and **COMPLETED**.
- Drag cards smoothly across columns using HTML5 native drag-and-drop.
- **Instant Optimistic UI**: Cards shift immediately while an asynchronous `PUT /api/tasks/:id` synchronizes state with MongoDB.
- Quick `+` action button on each column to create tasks directly in that stage.
- Filter Kanban board by Project or Priority.

### 5. Task Management & Collaboration
- Detailed task modal featuring title, description, project affiliation, assignee, priority, status, and due dates.
- Overdue indicators alerting users when deadlines have elapsed.
- **Real-Time Task Comments**: Threaded discussions with author avatars, timestamps, and delete permissions for authors and admins.

### 6. Team & Workload Balancing
- Roster of all team members displaying department, bio, and email.
- **Workload Metrics**: Assigned task count, completed task count, pending deliverables, and active project count per member.
- Member provisioning tool for administrators.

### 7. Notification System
- Navbar bell icon with a real-time unread counter badge.
- Notifications dispatched automatically on:
  - Task assignment
  - Task status transition
  - New comment on an assigned task
  - Project assignment
  - Task overdue alerts
- Dropdown preview and dedicated Notifications page with "Mark all as read".

### 8. User Profile & Settings
- Personal profile overview with career workload metrics.
- Editable profile form (Name, Department, Avatar URL, Bio, Password).
- Theme toggle: Seamless switching between **Light Mode** and **Dark Mode**.

### 9. Administration Panel
- Admin dashboard displaying platform telemetry.
- User management table with real-time search, role filtering, pagination, role modification dropdown, and user deletion.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **State Management**: React Context API (`AuthContext`, `ThemeContext`, `NotificationContext`)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Security**: `jsonwebtoken`, `bcryptjs`, `cors`
- **Configuration**: `dotenv`

### Database
- **ODM**: [Mongoose v8](https://mongoosejs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Supports MongoDB Atlas, Local Community Server, and automated In-Memory fallback for zero-configuration testing)

---

## 🏗 System Architecture

```
                    ┌─────────────────────────────────────────┐
                    │            Client Browser               │
                    │   React 18 + Vite + Tailwind CSS UI     │
                    └────────────────────┬────────────────────┘
                                         │
                                Axios HTTP Requests
                          (Bearer JWT in Auth Header)
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │           Express.js Server             │
                    │         (Node.js REST API :5000)        │
                    ├─────────────────────────────────────────┤
                    │ • CORS & Body Parser                    │
                    │ • Auth Middleware (JWT Verification)    │
                    │ • RBAC Middleware (Role Permissions)    │
                    │ • Central Error Handler Middleware      │
                    └────────────────────┬────────────────────┘
                                         │
                                Mongoose ODM Driver
                                         │
                                         ▼
                    ┌─────────────────────────────────────────┐
                    │            MongoDB Database             │
                    │    Collections: Users, Projects, Tasks, │
                    │          Comments, Notifications        │
                    └─────────────────────────────────────────┘
```

---

## 📂 Folder Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection & fallback
│   │   ├── controllers/
│   │   │   ├── authController.js     # Register, Login, GetMe
│   │   │   ├── userController.js     # User CRUD & workload calculations
│   │   │   ├── projectController.js  # Project CRUD & progress tracking
│   │   │   ├── taskController.js     # Task CRUD, filters & status update
│   │   │   ├── commentController.js  # Task comment operations
│   │   │   ├── notificationController.js # Notifications & read state
│   │   │   └── dashboardController.js # Aggregated platform metrics
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification
│   │   │   ├── role.js               # RBAC role guards
│   │   │   └── errorHandler.js       # Centralized exception formatting
│   │   ├── models/
│   │   │   ├── User.js               # User schema & password hashing
│   │   │   ├── Project.js            # Project schema & references
│   │   │   ├── Task.js               # Task schema & statuses
│   │   │   ├── Comment.js            # Comment schema
│   │   │   └── Notification.js       # Notification schema & alerts
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   ├── commentRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── seed/
│   │   │   └── seed.js               # Database demo seed script
│   │   ├── utils/
│   │   │   └── notificationHelper.js # Notification dispatcher
│   │   └── server.js                 # Express bootstrap & auto-seeder
│   ├── test-e2e.js                   # Automated E2E test suite
│   ├── .env
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top bar with search & notification badge
│   │   │   ├── Sidebar.jsx           # Responsive workspace navigation
│   │   │   ├── Button.jsx            # Reusable button with variants & spinners
│   │   │   ├── Modal.jsx             # Accessible modal dialogue
│   │   │   ├── Input.jsx             # Text, select, textarea inputs with errors
│   │   │   ├── TaskCard.jsx          # Draggable card for Kanban & lists
│   │   │   ├── ProjectCard.jsx       # Project card with progress bars
│   │   │   ├── StatusBadge.jsx       # Semantic status badges
│   │   │   ├── PriorityBadge.jsx     # Priority badges with icons
│   │   │   ├── LoadingSpinner.jsx    # Animated loading spinner
│   │   │   ├── EmptyState.jsx        # Fallback illustration state
│   │   │   ├── NotificationDropdown.jsx # Navbar notification popover
│   │   │   ├── ProtectedRoute.jsx    # Auth & Admin route guard
│   │   │   └── TaskDetailModal.jsx   # Interactive task editor & comments
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Global authentication provider
│   │   │   ├── ThemeContext.jsx      # Dark/Light mode provider
│   │   │   └── NotificationContext.jsx # Notification polling provider
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx        # Workspace dashboard layout wrapper
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Sign-in page with quick demo buttons
│   │   │   ├── Register.jsx          # Sign-up page with role selection
│   │   │   ├── Dashboard.jsx         # Executive overview & stats
│   │   │   ├── Projects.jsx          # Project directory & manager
│   │   │   ├── ProjectDetail.jsx     # Deep-dive view of a single project
│   │   │   ├── Tasks.jsx             # Global task list with filters & sorting
│   │   │   ├── MyTasks.jsx           # User's assigned deliverables
│   │   │   ├── Kanban.jsx            # 4-column drag-and-drop board
│   │   │   ├── Team.jsx              # Team workload capacity matrix
│   │   │   ├── Notifications.jsx     # Notifications center
│   │   │   ├── Profile.jsx           # User profile & metrics
│   │   │   ├── AdminPanel.jsx        # Admin user directory & stats
│   │   │   └── Settings.jsx          # Theme & system preferences
│   │   ├── services/
│   │   │   └── api.js                # Axios REST client with interceptors
│   │   ├── App.jsx                   # Route declarations
│   │   ├── main.jsx                  # React DOM mount point
│   │   └── index.css                 # Tailwind directives & styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── package.json                      # Root orchestration file
└── README.md
```

---

## 🗄 Database Design & Schemas

The database leverages 5 relational MongoDB collections modeled via Mongoose with clean foreign key references:

### 1. User Schema (`User.js`)
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  department: { type: String, default: 'Product Engineering' },
  createdAt: { type: Date, default: Date.now }
}
```

### 2. Project Schema (`Project.js`)
```javascript
{
  name: { type: String, required: true },
  description: { type: String, default: '' },
  startDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Planning', 'Active', 'On Hold', 'Completed'], default: 'Planning' },
  manager: { type: ObjectId, ref: 'User', required: true },
  members: [{ type: ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 3. Task Schema (`Task.js`)
```javascript
{
  title: { type: String, required: true },
  description: { type: String, default: '' },
  project: { type: ObjectId, ref: 'Project', required: true },
  assignedTo: { type: ObjectId, ref: 'User' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['To Do', 'In Progress', 'Review', 'Completed'], default: 'To Do' },
  dueDate: { type: Date },
  position: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 4. Comment Schema (`Comment.js`)
```javascript
{
  task: { type: ObjectId, ref: 'Task', required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}
```

### 5. Notification Schema (`Notification.js`)
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['task_assigned', 'status_changed', 'comment_added', 'project_assigned', 'task_overdue', 'general'],
    default: 'general'
  },
  message: { type: String, required: true },
  relatedTask: { type: ObjectId, ref: 'Task' },
  relatedProject: { type: ObjectId, ref: 'Project' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 📡 REST API Documentation

All private endpoints require the `Authorization: Bearer <JWT>` header.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |

### Users (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | Private | List all users with task counts & workload |
| `GET` | `/api/users/:id` | Private | Get user profile & workload metrics |
| `POST` | `/api/users` | Admin | Create a new user directly |
| `PUT` | `/api/users/:id` | Private | Update profile info or role (Admin only) |
| `DELETE` | `/api/users/:id` | Admin | Delete user and unassign their tasks |

### Projects (`/api/projects`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | Private | List projects with calculated progress % |
| `GET` | `/api/projects/:id` | Private | Project details, tasks, team & recent activity |
| `POST` | `/api/projects` | Private | Create a new project |
| `PUT` | `/api/projects/:id` | Private | Update project details (Admin or Manager) |
| `DELETE` | `/api/projects/:id` | Private | Delete project, tasks & comments |

### Tasks (`/api/tasks`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks` | Private | List tasks with filters (status, priority, project, assignee) |
| `GET` | `/api/tasks/:id` | Private | Get single task details with comments |
| `POST` | `/api/tasks` | Private | Create a new task (triggers assignment notification) |
| `PUT` | `/api/tasks/:id` | Private | Update task details or status (Kanban drop) |
| `DELETE` | `/api/tasks/:id` | Private | Delete task and its comments |

### Comments (`/api/tasks/:taskId/comments` & `/api/comments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tasks/:taskId/comments` | Private | Get all comments for a task |
| `POST` | `/api/tasks/:taskId/comments` | Private | Add comment (triggers notification) |
| `DELETE` | `/api/comments/:id` | Private | Delete comment (Author or Admin) |

### Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Private | Get all notifications & unread count |
| `PUT` | `/api/notifications/:id/read` | Private | Mark single notification as read |
| `PUT` | `/api/notifications/read-all` | Private | Mark all user notifications as read |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Private | Aggregated platform metrics & recent activity feed |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=taskflow_production_super_secret_jwt_key_2026_xyz_!
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 How to Run the Application

### Prerequisites
- Node.js v18+ installed on your system.

### Option 1: Quick Run from Project Root
From the `taskflow` directory:

1. **Install Dependencies**:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

2. **Start Backend**:
   ```bash
   npm run start:backend
   ```
   *(The server will start on http://localhost:5000 and auto-seed the demo database on first boot)*

3. **Start Frontend** (in a second terminal):
   ```bash
   npm run start:frontend
   ```
   *(Vite will serve the frontend on http://localhost:5173)*

4. Open your browser at **http://localhost:5173**.

---

## 🌱 Database Seeding

To manually repopulate the database with demo users, sample projects, tasks across all 4 Kanban columns, comments, and notifications:

```bash
cd backend
npm run seed
```

---

## 🔑 Demo Login Credentials

You can use the one-click demo login buttons on the login page or enter these credentials:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@taskflow.com` | `admin123` | Full access: Admin panel, user management, project deletion, all projects & tasks |
| **Member** | `member@taskflow.com` | `member123` | Standard team member: My tasks, Kanban board, status transitions, comments |
| **Member 2** | `sarah.j@taskflow.com` | `password123` | Platform architecture collaborator |
| **Member 3** | `alex.r@taskflow.com` | `password123` | Product design collaborator |

---

## 🚢 Deployment Guide

### Frontend Deployment (Vercel)
1. Push the code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com) and click **"New Project"**.
3. Set **Root Directory** to `frontend`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://taskflow-api.onrender.com/api`)
7. Click **Deploy**.

### Backend Deployment (Render / Railway)
1. In [Render](https://render.com), create a new **Web Service**.
2. Connect your repository and set **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `node src/server.js`
5. Add Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: Your [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI string
   - `JWT_SECRET`: A secure random secret string
   - `CLIENT_URL`: Your deployed Vercel frontend URL
   - `NODE_ENV`: `production`
6. Deploy service.

---

## ✅ Testing Checklist

Execute the automated test script:
```bash
node backend/test-e2e.js
```

### Manual Verification Steps:
- [x] **Registration**: Create a new user on `/register` and verify immediate redirection to the dashboard.
- [x] **Login**: Test both `admin@taskflow.com` and `member@taskflow.com` using the Quick Demo buttons.
- [x] **Dashboard Telemetry**: Check that total projects, active projects, tasks, and completion rate render correctly.
- [x] **Project Creation**: Create a new project and verify auto-calculated 0% initial progress.
- [x] **Task Creation**: Add a task to the project and verify it appears on the project board and global tasks list.
- [x] **Kanban Drag-and-Drop**: Drag a task card from **TO DO** to **IN PROGRESS** or **COMPLETED**; refresh the page and verify the status persisted in MongoDB.
- [x] **Discussion Threads**: Open a task modal, post a comment, and verify author avatar, timestamp, and delete functionality.
- [x] **In-App Notifications**: Assign a task to another user and observe the unread badge increment in the navbar.
- [x] **Admin Governance**: Log in as Admin, visit `/admin`, change a user's role from Member to Admin, and verify the update.
- [x] **Theme Persistence**: Switch to Dark Mode, refresh the browser, and ensure dark theme remains active.
- [x] **Sign Out**: Click "Sign Out" from the user menu; verify token removal from `localStorage` and redirect to `/login`.

---

## 🎓 Course Module Mapping for Internship Evaluations

When presenting this project during internship evaluations, refer to how each course module is implemented:

| Course Module | Concepts Demonstrated in TaskFlow | Code References |
| :--- | :--- | :--- |
| **Module 1: Frontend Foundations** | Semantic HTML5 structure, CSS variables, responsive grid & flexbox layouts, Tailwind CSS utility architecture, dark mode transitions. | `frontend/src/index.css`, `frontend/tailwind.config.js` |
| **Module 2: React.js** | Functional components, custom hooks, React Router v6 nested routes & protected guards, Context API (`AuthContext`, `ThemeContext`, `NotificationContext`), optimistic UI updates, drag-and-drop event handlers. | `frontend/src/pages/Kanban.jsx`, `frontend/src/context/` |
| **Module 3: Backend with Node.js & Express** | Modular Express router architecture, JWT token issuance & bearer header verification, bcrypt password hashing, role-based authorization middleware (`requireAdmin`), centralized error handling middleware. | `backend/src/middleware/`, `backend/src/controllers/` |
| **Module 4: Databases & Deployment** | Mongoose schemas with ObjectId references, aggregation pipelines for dashboard metrics, automated seed scripts, environment configuration (`.env`), deployment readiness for Vercel/Render and MongoDB Atlas. | `backend/src/models/`, `backend/src/config/db.js`, `backend/src/seed/` |

---

## 🔮 Future Enhancements
- Real-time WebSockets via Socket.io for multi-user simultaneous card dragging.
- Task file attachments using AWS S3 or Cloudinary.
- Export project Gantt charts and PDF milestone reports.
- Slack / Microsoft Teams webhook integration for status changes.

---

**Developed with precision for the Full-Stack Engineering Internship Course.**

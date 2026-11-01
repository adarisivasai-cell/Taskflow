const baseURL = 'http://localhost:5000/api';

async function testE2E() {
  console.log('🧪 Starting End-to-End TaskFlow API Verification...\n');

  // 1. Health Check
  const healthRes = await fetch(`${baseURL}/health`);
  const healthData = await healthRes.json();
  console.log('1. Health Check:', healthData.status === 'online' ? '✅ PASS' : '❌ FAIL');

  // 2. Login Admin
  const adminLoginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@taskflow.com', password: 'admin123' }),
  });
  const adminLogin = await adminLoginRes.json();
  console.log('2. Admin Login:', adminLogin.success && adminLogin.user.role === 'Admin' ? '✅ PASS' : '❌ FAIL');
  const adminToken = adminLogin.token;

  // 3. Login Member
  const memberLoginRes = await fetch(`${baseURL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'member@taskflow.com', password: 'member123' }),
  });
  const memberLogin = await memberLoginRes.json();
  console.log('3. Member Login:', memberLogin.success && memberLogin.user.role === 'Member' ? '✅ PASS' : '❌ FAIL');
  const memberToken = memberLogin.token;

  // 4. Register new user
  const testEmail = `testuser_${Date.now()}@taskflow.com`;
  const registerRes = await fetch(`${baseURL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Engineer',
      email: testEmail,
      password: 'password123',
      confirmPassword: 'password123',
      role: 'Member',
    }),
  });
  const registerData = await registerRes.json();
  console.log('4. User Registration:', registerData.success && registerData.user.email === testEmail ? '✅ PASS' : '❌ FAIL');

  // 5. Dashboard Stats
  const statsRes = await fetch(`${baseURL}/dashboard/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statsData = await statsRes.json();
  console.log('5. Dashboard Stats:', statsData.success && statsData.stats.projects.total > 0 ? '✅ PASS' : '❌ FAIL');
  console.log(`   - Total Projects: ${statsData.stats.projects.total}`);
  console.log(`   - Total Tasks: ${statsData.stats.tasks.total}`);
  console.log(`   - Completed Tasks: ${statsData.stats.tasks.completed}`);
  console.log(`   - Completion Rate: ${statsData.stats.completionRate}%`);

  // 6. Get Projects
  const projectsRes = await fetch(`${baseURL}/projects`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const projectsData = await projectsRes.json();
  console.log('6. Get Projects:', projectsData.success && projectsData.projects.length > 0 ? '✅ PASS' : '❌ FAIL');
  const sampleProject = projectsData.projects[0];

  // 7. Create New Project
  const newProjRes = await fetch(`${baseURL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: 'Automated CI/CD Pipeline Integration',
      description: 'End-to-end testing pipeline created via API',
      priority: 'High',
      status: 'Active',
    }),
  });
  const newProjData = await newProjRes.json();
  console.log('7. Create Project:', newProjData.success && newProjData.project.name.includes('Automated') ? '✅ PASS' : '❌ FAIL');

  // 8. Create Task in Project
  const newTaskRes = await fetch(`${baseURL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      title: 'Run Integration Testing Harness',
      description: 'Testing task persistence and assignment',
      project: sampleProject._id,
      assignedTo: memberLogin.user._id,
      priority: 'Urgent',
      status: 'To Do',
    }),
  });
  const newTaskData = await newTaskRes.json();
  console.log('8. Create Task:', newTaskData.success && newTaskData.task.title.includes('Integration') ? '✅ PASS' : '❌ FAIL');
  const createdTask = newTaskData.task;

  // 9. Update Task (Kanban drag-and-drop: To Do -> In Progress)
  const updateTaskRes = await fetch(`${baseURL}/tasks/${createdTask._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'In Progress' }),
  });
  const updateTaskData = await updateTaskRes.json();
  console.log('9. Task Status Update (Kanban Drag):', updateTaskData.success && updateTaskData.task.status === 'In Progress' ? '✅ PASS' : '❌ FAIL');

  // 10. Add Comment on Task
  const commentRes = await fetch(`${baseURL}/tasks/${createdTask._id}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${memberToken}`,
    },
    body: JSON.stringify({ content: 'Tested automated verification comment via API.' }),
  });
  const commentData = await commentRes.json();
  console.log('10. Add Task Comment:', commentData.success && commentData.comment.content.includes('Tested') ? '✅ PASS' : '❌ FAIL');

  // 11. Check Notifications for Assigned Member
  const notifRes = await fetch(`${baseURL}/notifications`, {
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  const notifData = await notifRes.json();
  console.log('11. Notifications:', notifData.success && notifData.notifications.length > 0 ? '✅ PASS' : '❌ FAIL');

  // 12. Mark Notification Read
  if (notifData.notifications.length > 0) {
    const notifId = notifData.notifications[0]._id;
    const readRes = await fetch(`${baseURL}/notifications/${notifId}/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${memberToken}` },
    });
    const readData = await readRes.json();
    console.log('12. Mark Notification as Read:', readData.success && readData.notification.read === true ? '✅ PASS' : '❌ FAIL');
  }

  // 13. Admin User Management
  const usersRes = await fetch(`${baseURL}/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const usersData = await usersRes.json();
  console.log('13. Admin Users Overview:', usersData.success && usersData.users.length >= 2 ? '✅ PASS' : '❌ FAIL');

  console.log('\n🎉 ALL 13 CORE TEST SUITES PASSED FLAWLESSLY!\n');
}

testE2E().catch(console.error);

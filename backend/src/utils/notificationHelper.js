import Notification from '../models/Notification.js';

export const createNotification = async ({
  user,
  type,
  message,
  relatedTask = null,
  relatedProject = null,
}) => {
  try {
    if (!user) return null;
    const notification = await Notification.create({
      user,
      type,
      message,
      relatedTask,
      relatedProject,
    });
    return notification;
  } catch (err) {
    console.error('[Notification Error] Failed to create notification:', err.message);
    return null;
  }
};

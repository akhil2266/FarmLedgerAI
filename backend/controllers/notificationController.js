const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const notificationModel = require('../models/notificationModel');

const listNotifications = catchAsync(async (req, res) => {
  const { isRead, page, limit } = req.query;
  const result = await notificationModel.listByUser(req.user.id, { isRead, page, limit });
  return new ApiResponse(200, result, 'Notifications fetched.').send(res);
});

const markAsRead = catchAsync(async (req, res) => {
  await notificationModel.markAsRead(req.params.id, req.user.id);
  return new ApiResponse(200, null, 'Notification marked as read.').send(res);
});

const markAllAsRead = catchAsync(async (req, res) => {
  await notificationModel.markAllAsRead(req.user.id);
  return new ApiResponse(200, null, 'All notifications marked as read.').send(res);
});

const deleteNotification = catchAsync(async (req, res) => {
  await notificationModel.remove(req.params.id, req.user.id);
  return new ApiResponse(200, null, 'Notification deleted.').send(res);
});

module.exports = { listNotifications, markAsRead, markAllAsRead, deleteNotification };

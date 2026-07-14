const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { param } = require('express-validator');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.listNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', [param('id').isInt()], validate, notificationController.markAsRead);
router.delete('/:id', [param('id').isInt()], validate, notificationController.deleteNotification);

module.exports = router;

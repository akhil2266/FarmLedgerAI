const express = require('express');
const adminController = require('../controllers/adminController');
const farmController = require('../controllers/farmController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { param } = require('express-validator');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/overview', adminController.getPlatformOverview);
router.get('/growth-trend', adminController.getGrowthTrend);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/deactivate', [param('id').isInt()], validate, adminController.deactivateUser);
router.patch('/users/:id/activate', [param('id').isInt()], validate, adminController.activateUser);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/farms', farmController.listAllFarms);

module.exports = router;

const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { generateReportValidator } = require('../validators/schemeValidator');

const router = express.Router();

router.use(authenticate);

router.post('/generate', generateReportValidator, validate, reportController.generateReport);
router.get('/', reportController.listReports);

module.exports = router;

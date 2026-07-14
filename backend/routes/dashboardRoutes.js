const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/overview', dashboardController.getOverview);
router.get('/investment-trend', dashboardController.getInvestmentTrend);
router.get('/profit-trend', dashboardController.getProfitTrend);
router.get('/expense-breakdown', dashboardController.getExpenseBreakdown);
router.get('/crop-wise-profit', dashboardController.getCropWiseProfit);
router.get('/revenue', dashboardController.getRevenue);
router.get('/roi-analysis', dashboardController.getRoiAnalysis);

module.exports = router;

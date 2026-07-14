const express = require('express');

const authRoutes = require('./authRoutes');
const farmRoutes = require('./farmRoutes');
const cropRoutes = require('./cropRoutes');
const expenseRoutes = require('./expenseRoutes');
const saleRoutes = require('./saleRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const aiRoutes = require('./aiRoutes');
const notificationRoutes = require('./notificationRoutes');
const schemeRoutes = require('./schemeRoutes');
const weatherRoutes = require('./weatherRoutes');
const reportRoutes = require('./reportRoutes');
const adminRoutes = require('./adminRoutes');
const buyerRoutes = require('./buyerRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/farms', farmRoutes);
router.use('/crops', cropRoutes);
router.use('/expenses', expenseRoutes);
router.use('/sales', saleRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);
router.use('/notifications', notificationRoutes);
router.use('/schemes', schemeRoutes);
router.use('/weather', weatherRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/marketplace', buyerRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'FarmLedger AI API is running.', timestamp: new Date().toISOString() });
});

module.exports = router;

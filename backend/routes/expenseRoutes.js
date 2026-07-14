const express = require('express');
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadReceipt } = require('../middleware/upload');
const { createExpenseValidator, updateExpenseValidator, idParamValidator } = require('../validators/expenseValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', uploadReceipt, createExpenseValidator, validate, expenseController.createExpense);
router.get('/', expenseController.listExpenses);
router.get('/summary/breakdown', expenseController.getBreakdown);
router.get('/summary/monthly-trend', expenseController.getMonthlyTrend);
router.get('/:id', idParamValidator, validate, expenseController.getExpense);
router.patch('/:id', uploadReceipt, updateExpenseValidator, validate, expenseController.updateExpense);
router.delete('/:id', idParamValidator, validate, expenseController.deleteExpense);

module.exports = router;

const { body, param } = require('express-validator');

const CATEGORIES = ['seeds', 'fertilizer', 'pesticide', 'labor', 'irrigation', 'machinery', 'fuel', 'transport', 'storage', 'rent', 'loan_interest', 'other'];
const PAYMENT_MODES = ['cash', 'upi', 'bank_transfer', 'cheque', 'credit', 'other'];

const createExpenseValidator = [
  body('farmId').isInt().withMessage('Valid farmId is required'),
  body('cropId').optional({ checkFalsy: true }).isInt(),
  body('category').isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('expenseDate').isISO8601().withMessage('Valid expenseDate is required (YYYY-MM-DD)'),
  body('paymentMode').optional().isIn(PAYMENT_MODES),
  body('quantity').optional({ checkFalsy: true }).isFloat({ min: 0 }),
];

const updateExpenseValidator = [
  param('id').isInt().withMessage('Invalid expense id'),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('category').optional().isIn(CATEGORIES),
  body('paymentMode').optional().isIn(PAYMENT_MODES),
];

const idParamValidator = [param('id').isInt().withMessage('Invalid id')];

module.exports = { createExpenseValidator, updateExpenseValidator, idParamValidator, CATEGORIES, PAYMENT_MODES };

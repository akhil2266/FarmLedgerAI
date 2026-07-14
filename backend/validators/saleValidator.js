const { body, param } = require('express-validator');

const PAYMENT_STATUSES = ['pending', 'partial', 'paid'];

const createSaleValidator = [
  body('farmId').isInt().withMessage('Valid farmId is required'),
  body('cropId').optional({ checkFalsy: true }).isInt(),
  body('buyerName').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('quantityKg').isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number'),
  body('pricePerKg').isFloat({ min: 0.01 }).withMessage('Price per kg must be a positive number'),
  body('saleDate').isISO8601().withMessage('Valid saleDate is required (YYYY-MM-DD)'),
  body('paymentStatus').optional().isIn(PAYMENT_STATUSES),
];

const updateSaleValidator = [
  param('id').isInt().withMessage('Invalid sale id'),
  body('quantityKg').optional().isFloat({ min: 0.01 }),
  body('pricePerKg').optional().isFloat({ min: 0.01 }),
  body('paymentStatus').optional().isIn(PAYMENT_STATUSES),
];

const idParamValidator = [param('id').isInt().withMessage('Invalid id')];

module.exports = { createSaleValidator, updateSaleValidator, idParamValidator, PAYMENT_STATUSES };

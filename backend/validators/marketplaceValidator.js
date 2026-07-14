const { body, param } = require('express-validator');

const createListingValidator = [
  body('cropName').trim().notEmpty().withMessage('Crop name is required'),
  body('quantityKg').isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number'),
  body('askingPricePerKg').isFloat({ min: 0.01 }).withMessage('Asking price must be a positive number'),
  body('qualityGrade').optional().isIn(['A', 'B', 'C']),
  body('availableFrom').isISO8601().withMessage('Valid availableFrom date is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('cropId').optional({ checkFalsy: true }).isInt(),
];

const listingStatusValidator = [
  param('id').isInt().withMessage('Invalid listing id'),
  body('status').isIn(['active', 'sold', 'expired', 'cancelled']).withMessage('Invalid status'),
];

const placeOrderValidator = [
  body('listingId').isInt().withMessage('Valid listingId is required'),
  body('quantityKg').isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number'),
  body('deliveryAddress').optional().trim().isLength({ max: 300 }),
];

const orderStatusValidator = [
  param('id').isInt().withMessage('Invalid order id'),
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
];

module.exports = { createListingValidator, listingStatusValidator, placeOrderValidator, orderStatusValidator };

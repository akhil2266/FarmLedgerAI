const { body, param } = require('express-validator');

const SEASONS = ['kharif', 'rabi', 'zaid', 'perennial'];
const STATUSES = ['planned', 'sowing', 'growing', 'harvested', 'failed'];

const createCropValidator = [
  body('farmId').isInt().withMessage('Valid farmId is required'),
  body('cropName').trim().notEmpty().withMessage('Crop name is required'),
  body('season').isIn(SEASONS).withMessage(`Season must be one of: ${SEASONS.join(', ')}`),
  body('areaAcres').isFloat({ min: 0.01 }).withMessage('Area must be a positive number'),
  body('sowingDate').isISO8601().withMessage('Valid sowingDate is required (YYYY-MM-DD)'),
  body('expectedHarvestDate').optional({ checkFalsy: true }).isISO8601(),
  body('expectedYieldKg').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('status').optional().isIn(STATUSES),
];

const updateCropValidator = [
  param('id').isInt().withMessage('Invalid crop id'),
  body('areaAcres').optional().isFloat({ min: 0.01 }),
  body('season').optional().isIn(SEASONS),
  body('status').optional().isIn(STATUSES),
  body('actualHarvestDate').optional({ checkFalsy: true }).isISO8601(),
  body('actualYieldKg').optional({ checkFalsy: true }).isFloat({ min: 0 }),
];

const idParamValidator = [param('id').isInt().withMessage('Invalid id')];

module.exports = { createCropValidator, updateCropValidator, idParamValidator, SEASONS, STATUSES };

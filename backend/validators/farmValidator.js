const { body, param, query: queryValidator } = require('express-validator');

const SOIL_TYPES = ['alluvial', 'black', 'red', 'laterite', 'arid', 'saline', 'peaty', 'forest', 'loamy', 'clay', 'sandy', 'silt'];
const IRRIGATION_TYPES = ['drip', 'sprinkler', 'flood', 'rainfed', 'canal', 'borewell', 'other'];

const createFarmValidator = [
  body('farmName').trim().notEmpty().withMessage('Farm name is required').isLength({ max: 150 }),
  body('farmSizeAcres').isFloat({ min: 0.01 }).withMessage('Farm size must be a positive number'),
  body('soilType').isIn(SOIL_TYPES).withMessage(`Soil type must be one of: ${SOIL_TYPES.join(', ')}`),
  body('irrigationType').isIn(IRRIGATION_TYPES).withMessage(`Irrigation type must be one of: ${IRRIGATION_TYPES.join(', ')}`),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('latitude').optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }),
  body('longitude').optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }),
  body('phLevel').optional({ checkFalsy: true }).isFloat({ min: 0, max: 14 }),
  body('nitrogenLevel').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('phosphorusLevel').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('potassiumLevel').optional({ checkFalsy: true }).isFloat({ min: 0 }),
];

const updateFarmValidator = [
  param('id').isInt().withMessage('Invalid farm id'),
  body('farmSizeAcres').optional().isFloat({ min: 0.01 }),
  body('soilType').optional().isIn(SOIL_TYPES),
  body('irrigationType').optional().isIn(IRRIGATION_TYPES),
  body('latitude').optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }),
  body('longitude').optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }),
];

const idParamValidator = [param('id').isInt().withMessage('Invalid id')];

const listQueryValidator = [
  queryValidator('page').optional().isInt({ min: 1 }),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = { createFarmValidator, updateFarmValidator, idParamValidator, listQueryValidator, SOIL_TYPES, IRRIGATION_TYPES };

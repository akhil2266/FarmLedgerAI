const { body, param } = require('express-validator');

const cropRecommendationValidator = [
  body('farmId').isInt().withMessage('Valid farmId is required'),
  body('nitrogen').isFloat({ min: 0 }).withMessage('Nitrogen (N) value is required'),
  body('phosphorus').isFloat({ min: 0 }).withMessage('Phosphorus (P) value is required'),
  body('potassium').isFloat({ min: 0 }).withMessage('Potassium (K) value is required'),
  body('temperature').isFloat().withMessage('Temperature is required'),
  body('humidity').isFloat({ min: 0, max: 100 }).withMessage('Humidity must be between 0 and 100'),
  body('ph').isFloat({ min: 0, max: 14 }).withMessage('pH must be between 0 and 14'),
  body('rainfall').isFloat({ min: 0 }).withMessage('Rainfall is required'),
];

const profitPredictionValidator = [
  body('cropName').trim().notEmpty().withMessage('Crop name is required'),
  body('areaAcres').isFloat({ min: 0.01 }).withMessage('Area must be a positive number'),
  body('estimatedCost').isFloat({ min: 0 }).withMessage('Estimated cost is required'),
  body('season').optional().isIn(['kharif', 'rabi', 'zaid', 'perennial']),
];

const pricePredictionValidator = [
  body('cropName').trim().notEmpty().withMessage('Crop name is required'),
  body('forecastHorizonDays').optional().isInt({ min: 1, max: 365 }),
];

const diseaseDetectionValidator = [
  body('cropName').optional().trim(),
];

const adviceIdParamValidator = [param('id').isInt().withMessage('Invalid id')];

module.exports = {
  cropRecommendationValidator, profitPredictionValidator, pricePredictionValidator,
  diseaseDetectionValidator, adviceIdParamValidator,
};

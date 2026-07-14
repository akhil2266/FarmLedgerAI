const express = require('express');
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadCropImage } = require('../middleware/upload');
const {
  cropRecommendationValidator, profitPredictionValidator, pricePredictionValidator,
  diseaseDetectionValidator, adviceIdParamValidator,
} = require('../validators/aiValidator');

const router = express.Router();

router.use(authenticate);

router.post('/crop-recommendation', cropRecommendationValidator, validate, aiController.cropRecommendation);
router.get('/crop-recommendation/history', aiController.cropRecommendationHistory);

router.post('/profit-prediction', profitPredictionValidator, validate, aiController.profitPrediction);
router.get('/profit-prediction/history', aiController.profitPredictionHistory);

router.post('/price-prediction', pricePredictionValidator, validate, aiController.pricePrediction);
router.get('/price-prediction/history', aiController.pricePredictionHistory);

router.post('/disease-detection', uploadCropImage, diseaseDetectionValidator, validate, aiController.diseaseDetection);
router.get('/disease-detection/history', aiController.diseaseDetectionHistory);

router.post('/financial-advisor', aiController.financialAdvisor);
router.get('/financial-advisor', aiController.listFinancialAdvice);
router.patch('/financial-advisor/:id/read', adviceIdParamValidator, validate, aiController.markAdviceRead);
router.delete('/financial-advisor/:id', adviceIdParamValidator, validate, aiController.dismissAdvice);

module.exports = router;

const express = require('express');
const cropController = require('../controllers/cropController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCropValidator, updateCropValidator, idParamValidator } = require('../validators/cropValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', createCropValidator, validate, cropController.createCrop);
router.get('/', cropController.listCrops);
router.get('/summary/crop-wise', cropController.getCropWiseSummary);
router.get('/:id', idParamValidator, validate, cropController.getCrop);
router.patch('/:id', updateCropValidator, validate, cropController.updateCrop);
router.delete('/:id', idParamValidator, validate, cropController.deleteCrop);

module.exports = router;

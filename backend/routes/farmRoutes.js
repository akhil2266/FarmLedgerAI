const express = require('express');
const farmController = require('../controllers/farmController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createFarmValidator, updateFarmValidator, idParamValidator } = require('../validators/farmValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', createFarmValidator, validate, farmController.createFarm);
router.get('/', farmController.listFarms);
router.get('/summary/stats', farmController.getFarmStats);
router.get('/:id', idParamValidator, validate, farmController.getFarm);
router.patch('/:id', updateFarmValidator, validate, farmController.updateFarm);
router.delete('/:id', idParamValidator, validate, farmController.deleteFarm);

// Admin-only: view all farms across the platform
router.get('/admin/all', authorize('admin'), farmController.listAllFarms);

module.exports = router;

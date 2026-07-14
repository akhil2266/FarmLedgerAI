const express = require('express');
const schemeController = require('../controllers/schemeController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createSchemeValidator } = require('../validators/schemeValidator');
const { param } = require('express-validator');

const router = express.Router();

router.use(authenticate);

router.get('/', schemeController.listSchemes);
router.get('/:id', [param('id').isInt()], validate, schemeController.getScheme);

// Admin-only management
router.post('/', authorize('admin'), createSchemeValidator, validate, schemeController.createScheme);
router.patch('/:id', authorize('admin'), [param('id').isInt()], validate, schemeController.updateScheme);
router.delete('/:id', authorize('admin'), [param('id').isInt()], validate, schemeController.deleteScheme);

module.exports = router;

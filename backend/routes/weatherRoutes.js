const express = require('express');
const weatherController = require('../controllers/weatherController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { param } = require('express-validator');

const router = express.Router();

router.use(authenticate);

router.get('/farm/:farmId', [param('farmId').isInt()], validate, weatherController.getFarmWeather);

module.exports = router;

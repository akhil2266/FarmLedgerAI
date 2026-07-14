const express = require('express');
const saleController = require('../controllers/saleController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadReceipt } = require('../middleware/upload');
const { createSaleValidator, updateSaleValidator, idParamValidator } = require('../validators/saleValidator');

const router = express.Router();

router.use(authenticate);

router.post('/', uploadReceipt, createSaleValidator, validate, saleController.createSale);
router.get('/', saleController.listSales);
router.get('/summary/monthly-revenue', saleController.getMonthlyRevenue);
router.get('/summary/yearly-revenue', saleController.getYearlyRevenue);
router.get('/:id', idParamValidator, validate, saleController.getSale);
router.patch('/:id', uploadReceipt, updateSaleValidator, validate, saleController.updateSale);
router.delete('/:id', idParamValidator, validate, saleController.deleteSale);

module.exports = router;

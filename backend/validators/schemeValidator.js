const { body } = require('express-validator');

const createSchemeValidator = [
  body('schemeName').trim().notEmpty().withMessage('Scheme name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['subsidy', 'insurance', 'loan', 'training', 'equipment', 'irrigation', 'other'])
    .withMessage('Invalid category'),
  body('officialLink').optional({ checkFalsy: true }).isURL().withMessage('Official link must be a valid URL'),
];

const generateReportValidator = [
  body('format').isIn(['pdf', 'excel']).withMessage('Format must be pdf or excel'),
  body('reportType').optional().isIn(['profit_loss', 'expense_summary', 'sales_summary', 'roi_analysis', 'full_farm_report']),
  body('dateFrom').optional({ checkFalsy: true }).isISO8601(),
  body('dateTo').optional({ checkFalsy: true }).isISO8601(),
];

module.exports = { createSchemeValidator, generateReportValidator };

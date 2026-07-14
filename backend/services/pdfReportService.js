const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

/**
 * Generates a Profit & Loss / financial summary PDF report and saves it to
 * uploads/reports/. Returns the relative file URL to be stored on the reports table.
 *
 * @param {object} params
 * @param {object} params.user - { full_name, email }
 * @param {object} params.overview - { totalInvestment, totalRevenue, netProfit, roiPercent }
 * @param {Array}  params.expenseBreakdown - [{ category, total }]
 * @param {Array}  params.cropWiseProfit - [{ crop_name, total_expense, total_revenue, profit }]
 * @param {Array}  params.sales - raw sales rows
 * @param {Array}  params.expenses - raw expense rows
 * @param {string} params.dateFrom
 * @param {string} params.dateTo
 */
const generateProfitLossPdf = async ({ user, overview, expenseBreakdown, cropWiseProfit, sales, expenses, dateFrom, dateTo }) => {
  const dir = path.join(process.cwd(), env.upload.dir, 'reports');
  ensureDir(dir);
  const filename = `profit-loss-${uuidv4()}.pdf`;
  const filepath = path.join(dir, filename);

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  // Header
  doc.fontSize(20).fillColor('#1B5E20').text('FarmLedger AI', { align: 'left' });
  doc.fontSize(14).fillColor('#333').text('Profit & Loss Report', { align: 'left' });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#666')
    .text(`Farmer: ${user.full_name} (${user.email})`)
    .text(`Period: ${dateFrom || 'All time'} to ${dateTo || 'Present'}`)
    .text(`Generated on: ${new Date().toLocaleString('en-IN')}`);
  doc.moveDown();
  doc.strokeColor('#1B5E20').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown();

  // KPI Summary
  doc.fontSize(13).fillColor('#1B5E20').text('Financial Summary');
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor('#000');
  doc.text(`Total Investment (Expenses): Rs. ${Number(overview.totalInvestment).toLocaleString('en-IN')}`);
  doc.text(`Total Revenue (Sales): Rs. ${Number(overview.totalRevenue).toLocaleString('en-IN')}`);
  doc.text(`Net Profit: Rs. ${Number(overview.netProfit).toLocaleString('en-IN')}`);
  doc.text(`Return on Investment (ROI): ${overview.roiPercent}%`);
  doc.moveDown();

  // Expense breakdown table
  doc.fontSize(13).fillColor('#1B5E20').text('Expense Breakdown by Category');
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#000');
  expenseBreakdown.forEach((row) => {
    doc.text(`${row.category.toUpperCase()}: Rs. ${Number(row.total).toLocaleString('en-IN')}`);
  });
  doc.moveDown();

  // Crop-wise profit table
  doc.fontSize(13).fillColor('#1B5E20').text('Crop-wise Profit Summary');
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#000');
  cropWiseProfit.forEach((row) => {
    doc.text(
      `${row.crop_name}: Expense Rs. ${Number(row.total_expense).toLocaleString('en-IN')} | ` +
      `Revenue Rs. ${Number(row.total_revenue).toLocaleString('en-IN')} | ` +
      `Profit Rs. ${Number(row.profit).toLocaleString('en-IN')}`
    );
  });
  doc.moveDown();

  // Sales detail
  if (sales.length) {
    doc.fontSize(13).fillColor('#1B5E20').text('Sales Detail');
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor('#000');
    sales.slice(0, 40).forEach((s) => {
      doc.text(`${s.sale_date} | ${s.buyer_name || 'N/A'} | ${s.quantity_kg} kg @ Rs.${s.price_per_kg}/kg = Rs. ${Number(s.total_amount).toLocaleString('en-IN')}`);
    });
    doc.moveDown();
  }

  // Expense detail
  if (expenses.length) {
    doc.fontSize(13).fillColor('#1B5E20').text('Expense Detail');
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor('#000');
    expenses.slice(0, 40).forEach((e) => {
      doc.text(`${e.expense_date} | ${e.category} | ${e.description || ''} | Rs. ${Number(e.amount).toLocaleString('en-IN')}`);
    });
  }

  doc.end();
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return `/uploads/reports/${filename}`;
};

module.exports = { generateProfitLossPdf };

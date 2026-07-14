const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const styleHeaderRow = (row) => {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B5E20' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });
};

/**
 * Generates a multi-sheet Excel workbook (Summary, Expenses, Sales, Crop-wise Profit)
 * and saves it to uploads/reports/. Returns the relative file URL.
 */
const generateProfitLossExcel = async ({ user, overview, expenseBreakdown, cropWiseProfit, sales, expenses, dateFrom, dateTo }) => {
  const dir = path.join(process.cwd(), env.upload.dir, 'reports');
  ensureDir(dir);
  const filename = `profit-loss-${uuidv4()}.xlsx`;
  const filepath = path.join(dir, filename);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FarmLedger AI';
  workbook.created = new Date();

  // ---- Summary sheet ----
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [{ width: 30 }, { width: 30 }];
  summarySheet.addRow(['FarmLedger AI - Profit & Loss Report']).font = { bold: true, size: 14 };
  summarySheet.addRow([`Farmer: ${user.full_name} (${user.email})`]);
  summarySheet.addRow([`Period: ${dateFrom || 'All time'} to ${dateTo || 'Present'}`]);
  summarySheet.addRow([`Generated on: ${new Date().toLocaleString('en-IN')}`]);
  summarySheet.addRow([]);
  const summaryHeader = summarySheet.addRow(['Metric', 'Value (INR)']);
  styleHeaderRow(summaryHeader);
  summarySheet.addRow(['Total Investment', Number(overview.totalInvestment)]);
  summarySheet.addRow(['Total Revenue', Number(overview.totalRevenue)]);
  summarySheet.addRow(['Net Profit', Number(overview.netProfit)]);
  summarySheet.addRow(['ROI %', `${overview.roiPercent}%`]);

  // ---- Expense breakdown sheet ----
  const expenseSheet = workbook.addWorksheet('Expense Breakdown');
  expenseSheet.columns = [{ header: 'Category', key: 'category', width: 25 }, { header: 'Total (INR)', key: 'total', width: 20 }];
  styleHeaderRow(expenseSheet.getRow(1));
  expenseBreakdown.forEach((row) => expenseSheet.addRow({ category: row.category, total: Number(row.total) }));

  // ---- Crop-wise profit sheet ----
  const cropSheet = workbook.addWorksheet('Crop-wise Profit');
  cropSheet.columns = [
    { header: 'Crop', key: 'crop_name', width: 20 },
    { header: 'Total Expense (INR)', key: 'total_expense', width: 20 },
    { header: 'Total Revenue (INR)', key: 'total_revenue', width: 20 },
    { header: 'Profit (INR)', key: 'profit', width: 20 },
  ];
  styleHeaderRow(cropSheet.getRow(1));
  cropWiseProfit.forEach((row) => cropSheet.addRow({
    crop_name: row.crop_name,
    total_expense: Number(row.total_expense),
    total_revenue: Number(row.total_revenue),
    profit: Number(row.profit),
  }));

  // ---- Sales detail sheet ----
  const salesSheet = workbook.addWorksheet('Sales');
  salesSheet.columns = [
    { header: 'Date', key: 'sale_date', width: 15 },
    { header: 'Buyer', key: 'buyer_name', width: 20 },
    { header: 'Quantity (kg)', key: 'quantity_kg', width: 15 },
    { header: 'Price/kg (INR)', key: 'price_per_kg', width: 15 },
    { header: 'Total (INR)', key: 'total_amount', width: 18 },
    { header: 'Market', key: 'market_name', width: 20 },
    { header: 'Payment Status', key: 'payment_status', width: 15 },
  ];
  styleHeaderRow(salesSheet.getRow(1));
  sales.forEach((s) => salesSheet.addRow({
    sale_date: s.sale_date, buyer_name: s.buyer_name, quantity_kg: Number(s.quantity_kg),
    price_per_kg: Number(s.price_per_kg), total_amount: Number(s.total_amount),
    market_name: s.market_name, payment_status: s.payment_status,
  }));

  // ---- Expenses detail sheet ----
  const expDetailSheet = workbook.addWorksheet('Expenses');
  expDetailSheet.columns = [
    { header: 'Date', key: 'expense_date', width: 15 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Description', key: 'description', width: 30 },
    { header: 'Amount (INR)', key: 'amount', width: 15 },
    { header: 'Payment Mode', key: 'payment_mode', width: 15 },
    { header: 'Vendor', key: 'vendor_name', width: 20 },
  ];
  styleHeaderRow(expDetailSheet.getRow(1));
  expenses.forEach((e) => expDetailSheet.addRow({
    expense_date: e.expense_date, category: e.category, description: e.description,
    amount: Number(e.amount), payment_mode: e.payment_mode, vendor_name: e.vendor_name,
  }));

  await workbook.xlsx.writeFile(filepath);
  return `/uploads/reports/${filename}`;
};

module.exports = { generateProfitLossExcel };

-- =====================================================================
-- FarmLedger AI - Sample Seed Data
-- Run AFTER schema.sql
-- NOTE: All demo password hashes below = bcrypt hash of "Password@123"
-- =====================================================================

USE farmledger_ai;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- USERS  (1 admin, 4 farmers, 2 buyers)
-- password for all demo users: Password@123
-- ---------------------------------------------------------------------
INSERT INTO users
(uuid, full_name, email, phone, password_hash, role, state, district, is_verified, is_active, created_at)
VALUES
(UUID(), 'System Admin', 'admin@farmledger.ai', '9000000001', '$2b$10$J8FkYTMKnSmJ0sBOBK.6t.q8baWmGlVWqwyPS.WFfhFkfuTaixsoy', 'admin', 'Telangana', 'Hyderabad', 1, 1, NOW()),
(UUID(), 'Ramesh Reddy', 'ramesh.reddy@example.com', '9000000002', '$2b$10$J8FkYTMKnSmJ0sBOBK.6t.q8baWmGlVWqwyPS.WFfhFkfuTaixsoy', 'farmer', 'Telangana', 'Nalgonda', 1, 1, NOW()),
(UUID(), 'Sita Devi', 'sita.devi@example.com', '9000000003', '$2b$10$J8FkYTMKnSmJ0sBOBK.6t.q8baWmGlVWqwyPS.WFfhFkfuTaixsoy', 'farmer', 'Punjab', 'Ludhiana', 1, 1, NOW()),
(UUID(), 'Manoj Patil', 'manoj.patil@example.com', '9000000004', '$2b$10$J8FkYTMKnSmJ0sBOBK.6t.q8baWmGlVWqwyPS.WFfhFkfuTaixsoy', 'farmer', 'Maharashtra', 'Nashik', 1, 1, NOW()),
(UUID(), 'Lakshmi Naidu', 'lakshmi.naidu@example.com', '9000000005', '$2b$10$J8FkYTMKnSmJ0sBOBK.6t.q8baWmGlVWqwyPS.WFfhFkfuTaixsoy', 'farmer', 'Andhra Pradesh', 'Guntur', 1, 1, NOW()),
(UUID(), 'AgroMart Traders', 'buyer1@agromart.com', '9000000006', '$2b$10$J8FkYTMKnSmJ0sBOBK.6t.q8baWmGlVWqwyPS.WFfhFkfuTaixsoy', 'buyer', 'Telangana', 'Hyderabad', 1, 1, NOW()),
(UUID(), 'FreshHarvest Exports', 'buyer2@freshharvest.com', '9000000007', '$2b$10$J8FkYTMKnSmJ0sBOBK.6t.q8baWmGlVWqwyPS.WFfhFkfuTaixsoy', 'buyer', 'Maharashtra', 'Pune', 1, 1, NOW());

-- ---------------------------------------------------------------------
-- CROP CATALOG (master list used for AI + dropdowns)
-- ---------------------------------------------------------------------
INSERT INTO crop_catalog (crop_name, crop_category, season, avg_duration_days, ideal_temp_min, ideal_temp_max, ideal_rainfall_mm, ideal_ph_min, ideal_ph_max) VALUES
('Rice', 'cereal', 'kharif', 120, 20, 37, 1500, 5.5, 6.5),
('Wheat', 'cereal', 'rabi', 130, 10, 25, 750, 6.0, 7.5),
('Maize', 'cereal', 'kharif', 100, 18, 32, 600, 5.5, 7.5),
('Cotton', 'cash_crop', 'kharif', 180, 21, 35, 700, 6.0, 8.0),
('Sugarcane', 'cash_crop', 'perennial', 365, 20, 38, 1500, 6.0, 7.5),
('Chickpea', 'pulse', 'rabi', 100, 10, 30, 400, 6.0, 7.5),
('Soybean', 'oilseed', 'kharif', 100, 20, 30, 650, 6.0, 7.0),
('Groundnut', 'oilseed', 'kharif', 110, 22, 32, 600, 6.0, 7.0),
('Tomato', 'vegetable', 'zaid', 90, 18, 29, 600, 6.0, 6.8),
('Onion', 'vegetable', 'rabi', 120, 13, 28, 650, 6.0, 7.0),
('Potato', 'vegetable', 'rabi', 100, 15, 25, 500, 5.0, 6.5),
('Banana', 'fruit', 'perennial', 300, 20, 35, 1200, 6.0, 7.5),
('Mango', 'fruit', 'perennial', 150, 24, 35, 900, 5.5, 7.5),
('Turmeric', 'spice', 'kharif', 240, 20, 35, 1200, 5.5, 7.5),
('Chilli', 'spice', 'kharif', 150, 20, 32, 600, 6.0, 7.0);

-- ---------------------------------------------------------------------
-- FARMS  (linked to farmer users, ids 2-5)
-- ---------------------------------------------------------------------
INSERT INTO farms (uuid, user_id, farm_name, farm_size_acres, soil_type, irrigation_type, latitude, longitude, state, district, village, pincode, ph_level, nitrogen_level, phosphorus_level, potassium_level, created_at) VALUES
(UUID(), 2, 'Reddy Farms - Main Field', 12.5, 'black', 'canal', 17.0435, 79.2674, 'Telangana', 'Nalgonda', 'Miryalaguda', '508207', 6.8, 280, 45, 210, NOW()),
(UUID(), 2, 'Reddy Farms - North Plot', 5.0, 'red', 'borewell', 17.0512, 79.2789, 'Telangana', 'Nalgonda', 'Miryalaguda', '508207', 6.5, 250, 40, 190, NOW()),
(UUID(), 3, 'Devi Wheat Estate', 20.0, 'alluvial', 'sprinkler', 30.9010, 75.8573, 'Punjab', 'Ludhiana', 'Sahnewal', '141120', 7.1, 300, 55, 230, NOW()),
(UUID(), 4, 'Patil Vineyard & Fields', 8.75, 'black', 'drip', 19.9975, 73.7898, 'Maharashtra', 'Nashik', 'Niphad', '422303', 6.9, 260, 48, 200, NOW()),
(UUID(), 5, 'Naidu Chilli Farms', 15.0, 'red', 'flood', 16.3067, 80.4365, 'Andhra Pradesh', 'Guntur', 'Tenali', '522201', 6.4, 240, 42, 180, NOW());

-- ---------------------------------------------------------------------
-- CROPS (planted cycles)
-- ---------------------------------------------------------------------
INSERT INTO crops (uuid, farm_id, user_id, crop_catalog_id, crop_name, variety, season, area_acres, sowing_date, expected_harvest_date, actual_harvest_date, expected_yield_kg, actual_yield_kg, status, created_at) VALUES
(UUID(), 1, 2, 1, 'Rice', 'BPT 5204', 'kharif', 8.0, '2025-06-15', '2025-10-15', '2025-10-18', 24000, 23500, 'harvested', NOW()),
(UUID(), 1, 2, 2, 'Wheat', 'HD 2967', 'rabi', 8.0, '2025-11-10', '2026-03-10', NULL, 21000, NULL, 'growing', NOW()),
(UUID(), 2, 2, 8, 'Groundnut', 'TAG 24', 'kharif', 5.0, '2025-06-20', '2025-10-10', '2025-10-12', 6500, 6200, 'harvested', NOW()),
(UUID(), 3, 3, 2, 'Wheat', 'PBW 725', 'rabi', 20.0, '2025-11-05', '2026-03-05', NULL, 56000, NULL, 'growing', NOW()),
(UUID(), 4, 4, 4, 'Cotton', 'Bunny BT', 'kharif', 8.75, '2025-05-25', '2025-11-20', '2025-11-25', 8800, 8450, 'harvested', NOW()),
(UUID(), 5, 5, 15, 'Chilli', 'Guntur Sannam', 'kharif', 15.0, '2025-06-01', '2025-11-01', '2025-11-05', 18000, 17200, 'harvested', NOW());

-- ---------------------------------------------------------------------
-- EXPENSES
-- ---------------------------------------------------------------------
INSERT INTO expenses (uuid, user_id, farm_id, crop_id, category, description, amount, quantity, unit, vendor_name, payment_mode, expense_date, created_at) VALUES
(UUID(), 2, 1, 1, 'seeds', 'Paddy seed BPT 5204', 18000, 200, 'kg', 'Krishi Seva Kendra', 'cash', '2025-06-10', NOW()),
(UUID(), 2, 1, 1, 'fertilizer', 'Urea + DAP', 32000, 800, 'kg', 'IFFCO Bazar', 'upi', '2025-06-25', NOW()),
(UUID(), 2, 1, 1, 'labor', 'Transplanting labor', 45000, 40, 'workdays', 'Local labor group', 'cash', '2025-06-18', NOW()),
(UUID(), 2, 1, 1, 'pesticide', 'Pest control spray', 12000, 20, 'litre', 'AgroChem Store', 'cash', '2025-08-05', NOW()),
(UUID(), 2, 1, 1, 'irrigation', 'Canal water charges', 8000, NULL, NULL, 'Irrigation Dept', 'bank_transfer', '2025-09-01', NOW()),
(UUID(), 2, 1, 1, 'machinery', 'Harvester rental', 22000, 2, 'days', 'Reddy Machinery', 'cash', '2025-10-16', NOW()),
(UUID(), 2, 2, 3, 'seeds', 'Groundnut seed TAG24', 15000, 150, 'kg', 'Krishi Seva Kendra', 'cash', '2025-06-15', NOW()),
(UUID(), 2, 2, 3, 'fertilizer', 'Gypsum + SSP', 9500, 300, 'kg', 'IFFCO Bazar', 'cash', '2025-07-05', NOW()),
(UUID(), 2, 2, 3, 'labor', 'Weeding & harvesting labor', 21000, 25, 'workdays', 'Local labor group', 'cash', '2025-10-08', NOW()),
(UUID(), 3, 3, 4, 'seeds', 'Wheat seed PBW725', 42000, 400, 'kg', 'Punjab Agro Store', 'bank_transfer', '2025-11-01', NOW()),
(UUID(), 3, 3, 4, 'fertilizer', 'NPK complex', 68000, 1200, 'kg', 'Punjab Agro Store', 'bank_transfer', '2025-11-08', NOW()),
(UUID(), 3, 3, 4, 'irrigation', 'Sprinkler operation cost', 15000, NULL, NULL, 'Self-owned', 'cash', '2025-12-01', NOW()),
(UUID(), 4, 4, 5, 'seeds', 'BT Cotton seed packets', 28000, 35, 'packets', 'Maha Cotton Seeds', 'upi', '2025-05-20', NOW()),
(UUID(), 4, 4, 5, 'pesticide', 'Bollworm control', 34000, 45, 'litre', 'AgroChem Store', 'cash', '2025-08-15', NOW()),
(UUID(), 4, 4, 5, 'labor', 'Picking labor (3 rounds)', 96000, 120, 'workdays', 'Local labor group', 'cash', '2025-10-20', NOW()),
(UUID(), 4, 4, 5, 'transport', 'Transport to ginning mill', 12000, NULL, NULL, 'Local Transport', 'cash', '2025-11-26', NOW()),
(UUID(), 5, 5, 6, 'seeds', 'Chilli nursery seedlings', 24000, 60000, 'plants', 'Guntur Nursery', 'cash', '2025-05-25', NOW()),
(UUID(), 5, 5, 6, 'fertilizer', 'Fertigation package', 41000, 1000, 'kg', 'AP Agro Center', 'cash', '2025-07-10', NOW()),
(UUID(), 5, 5, 6, 'pesticide', 'Thrips & mite control', 38000, 50, 'litre', 'AgroChem Store', 'cash', '2025-09-01', NOW()),
(UUID(), 5, 5, 6, 'labor', 'Harvesting (multi-pick)', 85000, 100, 'workdays', 'Local labor group', 'cash', '2025-11-02', NOW());

-- ---------------------------------------------------------------------
-- SALES
-- ---------------------------------------------------------------------
INSERT INTO sales (uuid, user_id, farm_id, crop_id, buyer_name, quantity_kg, price_per_kg, market_name, sale_date, payment_status, created_at) VALUES
(UUID(), 2, 1, 1, 'AgroMart Traders', 23500, 22.50, 'Miryalaguda Mandi', '2025-10-22', 'paid', NOW()),
(UUID(), 2, 2, 3, 'Local Oil Mill', 6200, 58.00, 'Nalgonda APMC', '2025-10-15', 'paid', NOW()),
(UUID(), 4, 4, 5, 'FreshHarvest Exports', 8450, 68.00, 'Nashik Cotton Market', '2025-11-28', 'paid', NOW()),
(UUID(), 5, 5, 6, 'AgroMart Traders', 17200, 85.00, 'Guntur Chilli Yard', '2025-11-08', 'partial', NOW());

-- ---------------------------------------------------------------------
-- GOVERNMENT SCHEMES
-- ---------------------------------------------------------------------
INSERT INTO govt_schemes (scheme_name, scheme_code, description, category, eligibility, benefits, applicable_states, official_link, is_active, created_at) VALUES
('PM-KISAN Samman Nidhi', 'PMKISAN', 'Direct income support scheme providing financial assistance to landholding farmer families across India.', 'subsidy', 'All landholding farmer families', 'Rs. 6000 per year in 3 equal installments', 'All India', 'https://pmkisan.gov.in', 1, NOW()),
('Pradhan Mantri Fasal Bima Yojana', 'PMFBY', 'Crop insurance scheme protecting farmers against crop loss due to natural calamities, pests, and diseases.', 'insurance', 'All farmers growing notified crops', 'Low premium crop insurance with full risk coverage', 'All India', 'https://pmfby.gov.in', 1, NOW()),
('Kisan Credit Card', 'KCC', 'Provides farmers with affordable short-term formal credit for agricultural and allied needs.', 'loan', 'All farmers, tenant farmers, and sharecroppers', 'Credit up to Rs. 3 lakh at subsidized interest rates', 'All India', 'https://www.myscheme.gov.in/schemes/kcc', 1, NOW()),
('Soil Health Card Scheme', 'SHC', 'Provides soil nutrient status and fertilizer recommendations to farmers every two years.', 'training', 'All farmers', 'Free soil testing and customized fertilizer recommendations', 'All India', 'https://soilhealth.dac.gov.in', 1, NOW()),
('Pradhan Mantri Krishi Sinchayee Yojana', 'PMKSY', 'Aims to improve farm water use efficiency through micro-irrigation.', 'irrigation', 'Farmers investing in drip/sprinkler irrigation', 'Up to 55% subsidy on micro-irrigation equipment', 'All India', 'https://pmksy.gov.in', 1, NOW()),
('National Agriculture Market (e-NAM)', 'ENAM', 'Pan-India electronic trading portal networking existing mandis for a unified national market.', 'other', 'Registered farmers and traders', 'Better price discovery and transparent online trading', 'All India', 'https://enam.gov.in', 1, NOW());

-- ---------------------------------------------------------------------
-- NOTIFICATIONS (sample)
-- ---------------------------------------------------------------------
INSERT INTO notifications (user_id, type, title, message, is_read, created_at) VALUES
(2, 'weather_alert', 'Heavy Rain Expected', 'Heavy rainfall expected in Nalgonda district over next 48 hours. Protect harvested stock.', 0, NOW()),
(2, 'price_alert', 'Rice Prices Rising', 'Rice modal price in Miryalaguda Mandi has risen 8% this week.', 0, NOW()),
(2, 'ai_advice', 'New Financial Advice Available', 'Your AI financial advisor has generated 3 new recommendations.', 0, NOW()),
(4, 'scheme_update', 'New Cotton Subsidy Announced', 'Maharashtra govt announced additional cotton MSP bonus for this season.', 0, NOW());

-- ---------------------------------------------------------------------
-- HISTORICAL CROP PRICES (used to train price-prediction model)
-- ---------------------------------------------------------------------
INSERT INTO historical_crop_prices (crop_name, market_name, state, price_date, min_price_per_kg, max_price_per_kg, modal_price_per_kg) VALUES
('Rice', 'Miryalaguda Mandi', 'Telangana', '2025-09-01', 19.50, 23.00, 21.20),
('Rice', 'Miryalaguda Mandi', 'Telangana', '2025-09-15', 20.00, 23.50, 21.75),
('Rice', 'Miryalaguda Mandi', 'Telangana', '2025-10-01', 20.50, 24.00, 22.10),
('Rice', 'Miryalaguda Mandi', 'Telangana', '2025-10-15', 21.00, 24.50, 22.50),
('Cotton', 'Nashik Cotton Market', 'Maharashtra', '2025-10-01', 62.00, 70.00, 66.00),
('Cotton', 'Nashik Cotton Market', 'Maharashtra', '2025-11-01', 64.00, 72.00, 68.00),
('Chilli', 'Guntur Chilli Yard', 'Andhra Pradesh', '2025-10-01', 78.00, 90.00, 83.50),
('Chilli', 'Guntur Chilli Yard', 'Andhra Pradesh', '2025-11-01', 80.00, 92.00, 85.00),
('Groundnut', 'Nalgonda APMC', 'Telangana', '2025-09-15', 52.00, 60.00, 56.00),
('Groundnut', 'Nalgonda APMC', 'Telangana', '2025-10-15', 54.00, 62.00, 58.00);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- FarmLedger AI - Complete MySQL Database Schema
-- Version: 1.0.0
-- Engine: InnoDB | Charset: utf8mb4
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;



-- =====================================================================
-- 1. USERS  (farmers, buyers, admins) - single table w/ role discriminator
-- =====================================================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid                CHAR(36) NOT NULL UNIQUE,
  full_name           VARCHAR(150) NOT NULL,
  email               VARCHAR(150) NOT NULL UNIQUE,
  phone               VARCHAR(20) UNIQUE,
  password_hash       VARCHAR(255) NULL,           -- NULL when google_id is used
  google_id           VARCHAR(120) NULL UNIQUE,
  role                ENUM('farmer','buyer','admin') NOT NULL DEFAULT 'farmer',
  avatar_url          VARCHAR(500) NULL,
  address             VARCHAR(255) NULL,
  state               VARCHAR(100) NULL,
  district            VARCHAR(100) NULL,
  pincode             VARCHAR(10) NULL,
  language_preference VARCHAR(10) NOT NULL DEFAULT 'en',
  theme_preference    ENUM('light','dark','system') NOT NULL DEFAULT 'system',
  is_verified         TINYINT(1) NOT NULL DEFAULT 0,
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at       DATETIME NULL,
  refresh_token       VARCHAR(500) NULL,
  reset_password_token VARCHAR(255) NULL,
  reset_password_expires DATETIME NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_state_district (state, district)
) ENGINE=InnoDB;

-- =====================================================================
-- 2. FARMS
-- =====================================================================
DROP TABLE IF EXISTS farms;
CREATE TABLE farms (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid            CHAR(36) NOT NULL UNIQUE,
  user_id         BIGINT UNSIGNED NOT NULL,
  farm_name       VARCHAR(150) NOT NULL,
  farm_size_acres DECIMAL(10,2) NOT NULL DEFAULT 0,
  soil_type       ENUM('alluvial','black','red','laterite','arid','saline','peaty','forest','loamy','clay','sandy','silt') NOT NULL DEFAULT 'loamy',
  irrigation_type ENUM('drip','sprinkler','flood','rainfed','canal','borewell','other') NOT NULL DEFAULT 'rainfed',
  latitude        DECIMAL(10,6) NULL,
  longitude       DECIMAL(10,6) NULL,
  address         VARCHAR(255) NULL,
  state           VARCHAR(100) NOT NULL,
  district        VARCHAR(100) NOT NULL,
  village         VARCHAR(100) NULL,
  pincode         VARCHAR(10) NULL,
  ph_level        DECIMAL(4,2) NULL,
  nitrogen_level  DECIMAL(6,2) NULL,
  phosphorus_level DECIMAL(6,2) NULL,
  potassium_level DECIMAL(6,2) NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_farms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_farms_user (user_id),
  INDEX idx_farms_location (state, district)
) ENGINE=InnoDB;

-- =====================================================================
-- 3. CROP CATALOG (master reference data used by AI + UI dropdowns)
-- =====================================================================
DROP TABLE IF EXISTS crop_catalog;
CREATE TABLE crop_catalog (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  crop_name           VARCHAR(100) NOT NULL UNIQUE,
  crop_category       ENUM('cereal','pulse','oilseed','vegetable','fruit','cash_crop','spice','fiber','other') NOT NULL,
  season              ENUM('kharif','rabi','zaid','perennial') NOT NULL,
  avg_duration_days   INT UNSIGNED NOT NULL DEFAULT 90,
  ideal_temp_min      DECIMAL(5,2) NULL,
  ideal_temp_max      DECIMAL(5,2) NULL,
  ideal_rainfall_mm   DECIMAL(7,2) NULL,
  ideal_ph_min        DECIMAL(4,2) NULL,
  ideal_ph_max        DECIMAL(4,2) NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- 4. CROPS (a farmer's planted crop cycle instance on a farm)
-- =====================================================================
DROP TABLE IF EXISTS crops;
CREATE TABLE crops (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid             CHAR(36) NOT NULL UNIQUE,
  farm_id          BIGINT UNSIGNED NOT NULL,
  user_id          BIGINT UNSIGNED NOT NULL,
  crop_catalog_id  INT UNSIGNED NULL,
  crop_name        VARCHAR(100) NOT NULL,
  variety          VARCHAR(100) NULL,
  season           ENUM('kharif','rabi','zaid','perennial') NOT NULL,
  area_acres       DECIMAL(10,2) NOT NULL DEFAULT 0,
  sowing_date      DATE NOT NULL,
  expected_harvest_date DATE NULL,
  actual_harvest_date   DATE NULL,
  expected_yield_kg     DECIMAL(12,2) NULL,
  actual_yield_kg       DECIMAL(12,2) NULL,
  status           ENUM('planned','sowing','growing','harvested','failed') NOT NULL DEFAULT 'planned',
  notes            TEXT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_crops_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  CONSTRAINT fk_crops_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_crops_catalog FOREIGN KEY (crop_catalog_id) REFERENCES crop_catalog(id) ON DELETE SET NULL,
  INDEX idx_crops_farm (farm_id),
  INDEX idx_crops_user (user_id),
  INDEX idx_crops_status (status),
  INDEX idx_crops_season (season)
) ENGINE=InnoDB;

-- =====================================================================
-- 5. EXPENSES
-- =====================================================================
DROP TABLE IF EXISTS expenses;
CREATE TABLE expenses (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid          CHAR(36) NOT NULL UNIQUE,
  user_id       BIGINT UNSIGNED NOT NULL,
  farm_id       BIGINT UNSIGNED NOT NULL,
  crop_id       BIGINT UNSIGNED NULL,
  category      ENUM('seeds','fertilizer','pesticide','labor','irrigation','machinery','fuel','transport','storage','rent','loan_interest','other') NOT NULL,
  description   VARCHAR(255) NULL,
  amount        DECIMAL(12,2) NOT NULL,
  quantity      DECIMAL(10,2) NULL,
  unit          VARCHAR(30) NULL,
  vendor_name   VARCHAR(150) NULL,
  payment_mode  ENUM('cash','upi','bank_transfer','cheque','credit','other') NOT NULL DEFAULT 'cash',
  expense_date  DATE NOT NULL,
  receipt_url   VARCHAR(500) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_expenses_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  CONSTRAINT fk_expenses_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
  INDEX idx_expenses_user_date (user_id, expense_date),
  INDEX idx_expenses_farm (farm_id),
  INDEX idx_expenses_crop (crop_id),
  INDEX idx_expenses_category (category)
) ENGINE=InnoDB;

-- =====================================================================
-- 6. SALES
-- =====================================================================
DROP TABLE IF EXISTS sales;
CREATE TABLE sales (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid           CHAR(36) NOT NULL UNIQUE,
  user_id        BIGINT UNSIGNED NOT NULL,
  farm_id        BIGINT UNSIGNED NOT NULL,
  crop_id        BIGINT UNSIGNED NULL,
  buyer_id       BIGINT UNSIGNED NULL,
  buyer_name     VARCHAR(150) NULL,
  quantity_kg    DECIMAL(12,2) NOT NULL,
  price_per_kg   DECIMAL(10,2) NOT NULL,
  total_amount   DECIMAL(14,2) GENERATED ALWAYS AS (quantity_kg * price_per_kg) STORED,
  market_name    VARCHAR(150) NULL,
  sale_date      DATE NOT NULL,
  payment_status ENUM('pending','partial','paid') NOT NULL DEFAULT 'pending',
  invoice_url    VARCHAR(500) NULL,
  notes          TEXT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sales_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sales_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  CONSTRAINT fk_sales_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
  CONSTRAINT fk_sales_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_sales_user_date (user_id, sale_date),
  INDEX idx_sales_farm (farm_id),
  INDEX idx_sales_crop (crop_id),
  INDEX idx_sales_buyer (buyer_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 7. AI: CROP RECOMMENDATIONS (log of AI outputs)
-- =====================================================================
DROP TABLE IF EXISTS ai_crop_recommendations;
CREATE TABLE ai_crop_recommendations (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT UNSIGNED NOT NULL,
  farm_id        BIGINT UNSIGNED NOT NULL,
  nitrogen       DECIMAL(6,2) NOT NULL,
  phosphorus     DECIMAL(6,2) NOT NULL,
  potassium      DECIMAL(6,2) NOT NULL,
  temperature    DECIMAL(5,2) NOT NULL,
  humidity       DECIMAL(5,2) NOT NULL,
  ph             DECIMAL(4,2) NOT NULL,
  rainfall       DECIMAL(7,2) NOT NULL,
  recommended_crop VARCHAR(100) NOT NULL,
  confidence_score DECIMAL(5,4) NOT NULL,
  top_alternatives JSON NULL,
  model_version  VARCHAR(30) NOT NULL DEFAULT 'v1',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_air_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_air_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  INDEX idx_air_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 8. AI: PROFIT PREDICTIONS
-- =====================================================================
DROP TABLE IF EXISTS ai_profit_predictions;
CREATE TABLE ai_profit_predictions (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          BIGINT UNSIGNED NOT NULL,
  crop_id          BIGINT UNSIGNED NULL,
  crop_name        VARCHAR(100) NOT NULL,
  area_acres       DECIMAL(10,2) NOT NULL,
  estimated_cost   DECIMAL(14,2) NOT NULL,
  predicted_yield_kg DECIMAL(12,2) NOT NULL,
  predicted_price_per_kg DECIMAL(10,2) NOT NULL,
  predicted_revenue DECIMAL(14,2) NOT NULL,
  predicted_profit  DECIMAL(14,2) NOT NULL,
  predicted_roi_percent DECIMAL(7,2) NOT NULL,
  model_version    VARCHAR(30) NOT NULL DEFAULT 'v1',
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_app_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
  INDEX idx_app_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 9. AI: PRICE PREDICTIONS
-- =====================================================================
DROP TABLE IF EXISTS ai_price_predictions;
CREATE TABLE ai_price_predictions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  crop_name       VARCHAR(100) NOT NULL,
  market_name     VARCHAR(150) NULL,
  state           VARCHAR(100) NULL,
  predicted_price_per_kg DECIMAL(10,2) NOT NULL,
  prediction_date DATE NOT NULL,
  forecast_horizon_days INT UNSIGNED NOT NULL DEFAULT 30,
  confidence_score DECIMAL(5,4) NOT NULL,
  model_version   VARCHAR(30) NOT NULL DEFAULT 'v1',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_apr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_apr_user_crop (user_id, crop_name)
) ENGINE=InnoDB;

-- =====================================================================
-- 10. AI: DISEASE DETECTIONS
-- =====================================================================
DROP TABLE IF EXISTS ai_disease_detections;
CREATE TABLE ai_disease_detections (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED NOT NULL,
  crop_id         BIGINT UNSIGNED NULL,
  crop_name       VARCHAR(100) NOT NULL,
  image_url       VARCHAR(500) NOT NULL,
  detected_disease VARCHAR(150) NOT NULL,
  is_healthy      TINYINT(1) NOT NULL DEFAULT 0,
  confidence_score DECIMAL(5,4) NOT NULL,
  severity        ENUM('none','low','medium','high','critical') NOT NULL DEFAULT 'none',
  recommended_treatment TEXT NULL,
  model_version   VARCHAR(30) NOT NULL DEFAULT 'v1',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_add_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_add_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
  INDEX idx_add_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 11. AI: FINANCIAL ADVISOR RECOMMENDATIONS
-- =====================================================================
DROP TABLE IF EXISTS ai_financial_advice;
CREATE TABLE ai_financial_advice (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        BIGINT UNSIGNED NOT NULL,
  advice_type    ENUM('cost_reduction','crop_diversification','loan_management','investment','risk_alert','market_timing','general') NOT NULL,
  title          VARCHAR(200) NOT NULL,
  description    TEXT NOT NULL,
  priority       ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  is_read        TINYINT(1) NOT NULL DEFAULT 0,
  is_dismissed   TINYINT(1) NOT NULL DEFAULT 0,
  metadata       JSON NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_afa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_afa_user (user_id, is_read)
) ENGINE=InnoDB;

-- =====================================================================
-- 12. WEATHER LOGS (cached weather pulls per farm)
-- =====================================================================
DROP TABLE IF EXISTS weather_logs;
CREATE TABLE weather_logs (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  farm_id        BIGINT UNSIGNED NOT NULL,
  temperature    DECIMAL(5,2) NOT NULL,
  feels_like     DECIMAL(5,2) NULL,
  humidity       DECIMAL(5,2) NOT NULL,
  rainfall_mm    DECIMAL(7,2) NULL,
  wind_speed_kmh DECIMAL(6,2) NULL,
  condition_text VARCHAR(100) NULL,
  condition_icon VARCHAR(150) NULL,
  forecast_date  DATE NOT NULL,
  is_forecast    TINYINT(1) NOT NULL DEFAULT 0,
  raw_payload    JSON NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_weather_farm FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  INDEX idx_weather_farm_date (farm_id, forecast_date)
) ENGINE=InnoDB;

-- =====================================================================
-- 13. GOVERNMENT SCHEMES
-- =====================================================================
DROP TABLE IF EXISTS govt_schemes;
CREATE TABLE govt_schemes (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  scheme_name      VARCHAR(200) NOT NULL,
  scheme_code      VARCHAR(50) NULL UNIQUE,
  description      TEXT NOT NULL,
  category         ENUM('subsidy','insurance','loan','training','equipment','irrigation','other') NOT NULL,
  eligibility      TEXT NULL,
  benefits         TEXT NULL,
  applicable_states VARCHAR(500) NULL DEFAULT 'All India',
  official_link    VARCHAR(500) NULL,
  application_deadline DATE NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_schemes_category (category)
) ENGINE=InnoDB;

-- =====================================================================
-- 14. NOTIFICATIONS
-- =====================================================================
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  type         ENUM('weather_alert','price_alert','disease_alert','scheme_update','payment','system','ai_advice','sale','expense') NOT NULL,
  title        VARCHAR(200) NOT NULL,
  message      TEXT NOT NULL,
  link         VARCHAR(300) NULL,
  is_read      TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- =====================================================================
-- 15. REPORTS (generated PDF/Excel export log)
-- =====================================================================
DROP TABLE IF EXISTS reports;
CREATE TABLE reports (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      BIGINT UNSIGNED NOT NULL,
  report_type  ENUM('profit_loss','expense_summary','sales_summary','roi_analysis','full_farm_report') NOT NULL,
  format       ENUM('pdf','excel') NOT NULL,
  file_url     VARCHAR(500) NOT NULL,
  date_from    DATE NULL,
  date_to      DATE NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reports_user (user_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 16. BUYER <-> FARMER MARKETPLACE ORDERS (buyer dashboard)
-- =====================================================================
DROP TABLE IF EXISTS marketplace_listings;
CREATE TABLE marketplace_listings (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid           CHAR(36) NOT NULL UNIQUE,
  farmer_id      BIGINT UNSIGNED NOT NULL,
  crop_id        BIGINT UNSIGNED NULL,
  crop_name      VARCHAR(100) NOT NULL,
  quantity_kg    DECIMAL(12,2) NOT NULL,
  asking_price_per_kg DECIMAL(10,2) NOT NULL,
  quality_grade  ENUM('A','B','C') NOT NULL DEFAULT 'A',
  available_from DATE NOT NULL,
  state          VARCHAR(100) NOT NULL,
  district       VARCHAR(100) NOT NULL,
  status         ENUM('active','sold','expired','cancelled') NOT NULL DEFAULT 'active',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_listing_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_listing_crop FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE SET NULL,
  INDEX idx_listing_status (status),
  INDEX idx_listing_location (state, district)
) ENGINE=InnoDB;

DROP TABLE IF EXISTS marketplace_orders;
CREATE TABLE marketplace_orders (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid           CHAR(36) NOT NULL UNIQUE,
  listing_id     BIGINT UNSIGNED NOT NULL,
  buyer_id       BIGINT UNSIGNED NOT NULL,
  farmer_id      BIGINT UNSIGNED NOT NULL,
  quantity_kg    DECIMAL(12,2) NOT NULL,
  agreed_price_per_kg DECIMAL(10,2) NOT NULL,
  total_amount   DECIMAL(14,2) GENERATED ALWAYS AS (quantity_kg * agreed_price_per_kg) STORED,
  status         ENUM('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  delivery_address VARCHAR(300) NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_listing FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_farmer FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_order_buyer (buyer_id),
  INDEX idx_order_farmer (farmer_id)
) ENGINE=InnoDB;

-- =====================================================================
-- 17. AUDIT LOG (admin dashboard activity feed)
-- =====================================================================
DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NULL,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id   BIGINT UNSIGNED NULL,
  ip_address  VARCHAR(45) NULL,
  metadata    JSON NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action)
) ENGINE=InnoDB;

-- =====================================================================
-- 18. HISTORICAL CROP PRICES (training data source for price prediction AI)
-- =====================================================================
DROP TABLE IF EXISTS historical_crop_prices;
CREATE TABLE historical_crop_prices (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  crop_name    VARCHAR(100) NOT NULL,
  market_name  VARCHAR(150) NULL,
  state        VARCHAR(100) NULL,
  price_date   DATE NOT NULL,
  min_price_per_kg DECIMAL(10,2) NOT NULL,
  max_price_per_kg DECIMAL(10,2) NOT NULL,
  modal_price_per_kg DECIMAL(10,2) NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hcp_crop_date (crop_name, price_date)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

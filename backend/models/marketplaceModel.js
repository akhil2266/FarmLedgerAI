const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// ---------------------- LISTINGS ----------------------

const createListing = async (farmerId, data) => {
  const uuid = uuidv4();
  const result = await query(
    `INSERT INTO marketplace_listings
      (uuid, farmer_id, crop_id, crop_name, quantity_kg, asking_price_per_kg,
       quality_grade, available_from, state, district)
     VALUES
      (:uuid, :farmerId, :cropId, :cropName, :quantityKg, :askingPricePerKg,
       :qualityGrade, :availableFrom, :state, :district)`,
    {
      uuid,
      farmerId,
      cropId: data.cropId ?? null,
      cropName: data.cropName,
      quantityKg: data.quantityKg,
      askingPricePerKg: data.askingPricePerKg,
      qualityGrade: data.qualityGrade || 'A',
      availableFrom: data.availableFrom,
      state: data.state,
      district: data.district,
    }
  );
  return findListingById(result.insertId);
};

const findListingById = async (id) => {
  const rows = await query(
    `SELECT l.*, u.full_name AS farmer_name, u.phone AS farmer_phone
     FROM marketplace_listings l JOIN users u ON u.id = l.farmer_id
     WHERE l.id = :id LIMIT 1`,
    { id }
  );
  return rows[0] || null;
};

const listActiveListings = async ({ cropName, state, district, page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const where = [`l.status = 'active'`];
  const params = { limit: Number(limit), offset: Number(offset) };
  if (cropName) { where.push('l.crop_name LIKE :cropName'); params.cropName = `%${cropName}%`; }
  if (state) { where.push('l.state = :state'); params.state = state; }
  if (district) { where.push('l.district = :district'); params.district = district; }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const rows = await query(
    `SELECT l.*, u.full_name AS farmer_name
     FROM marketplace_listings l JOIN users u ON u.id = l.farmer_id
     ${whereSql} ORDER BY l.created_at DESC LIMIT :limit OFFSET :offset`,
    params
  );
  const countRows = await query(`SELECT COUNT(*) AS total FROM marketplace_listings l ${whereSql}`, params);
  return { rows, total: countRows[0].total };
};

const listByFarmer = async (farmerId) => {
  return query(
    `SELECT * FROM marketplace_listings WHERE farmer_id = :farmerId ORDER BY created_at DESC`,
    { farmerId }
  );
};

const updateListingStatus = async (id, status) => {
  await query(`UPDATE marketplace_listings SET status = :status WHERE id = :id`, { id, status });
  return findListingById(id);
};

// ---------------------- ORDERS ----------------------

const createOrder = async (buyerId, listing, { quantityKg, deliveryAddress }) => {
  const uuid = uuidv4();
  const result = await query(
    `INSERT INTO marketplace_orders
      (uuid, listing_id, buyer_id, farmer_id, quantity_kg, agreed_price_per_kg, delivery_address, status)
     VALUES
      (:uuid, :listingId, :buyerId, :farmerId, :quantityKg, :agreedPrice, :deliveryAddress, 'pending')`,
    {
      uuid,
      listingId: listing.id,
      buyerId,
      farmerId: listing.farmer_id,
      quantityKg,
      agreedPrice: listing.asking_price_per_kg,
      deliveryAddress: deliveryAddress ?? null,
    }
  );
  return findOrderById(result.insertId);
};

const findOrderById = async (id) => {
  const rows = await query(
    `SELECT o.*, l.crop_name, bu.full_name AS buyer_name, fu.full_name AS farmer_name
     FROM marketplace_orders o
     JOIN marketplace_listings l ON l.id = o.listing_id
     JOIN users bu ON bu.id = o.buyer_id
     JOIN users fu ON fu.id = o.farmer_id
     WHERE o.id = :id LIMIT 1`,
    { id }
  );
  return rows[0] || null;
};

const listOrdersByBuyer = async (buyerId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const rows = await query(
    `SELECT o.*, l.crop_name, fu.full_name AS farmer_name
     FROM marketplace_orders o
     JOIN marketplace_listings l ON l.id = o.listing_id
     JOIN users fu ON fu.id = o.farmer_id
     WHERE o.buyer_id = :buyerId ORDER BY o.created_at DESC LIMIT :limit OFFSET :offset`,
    { buyerId, limit: Number(limit), offset: Number(offset) }
  );
  const countRows = await query(`SELECT COUNT(*) AS total FROM marketplace_orders WHERE buyer_id = :buyerId`, { buyerId });
  return { rows, total: countRows[0].total };
};

const listOrdersByFarmer = async (farmerId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const rows = await query(
    `SELECT o.*, l.crop_name, bu.full_name AS buyer_name
     FROM marketplace_orders o
     JOIN marketplace_listings l ON l.id = o.listing_id
     JOIN users bu ON bu.id = o.buyer_id
     WHERE o.farmer_id = :farmerId ORDER BY o.created_at DESC LIMIT :limit OFFSET :offset`,
    { farmerId, limit: Number(limit), offset: Number(offset) }
  );
  const countRows = await query(`SELECT COUNT(*) AS total FROM marketplace_orders WHERE farmer_id = :farmerId`, { farmerId });
  return { rows, total: countRows[0].total };
};

const updateOrderStatus = async (id, status) => {
  await query(`UPDATE marketplace_orders SET status = :status WHERE id = :id`, { id, status });
  return findOrderById(id);
};

module.exports = {
  createListing, findListingById, listActiveListings, listByFarmer, updateListingStatus,
  createOrder, findOrderById, listOrdersByBuyer, listOrdersByFarmer, updateOrderStatus,
};

const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const marketplaceModel = require('../models/marketplaceModel');
const notificationModel = require('../models/notificationModel');

// ---------------------- LISTINGS (created by farmers) ----------------------

/** POST /api/marketplace/listings (farmer only) */
const createListing = catchAsync(async (req, res) => {
  const listing = await marketplaceModel.createListing(req.user.id, req.body);
  return new ApiResponse(201, listing, 'Listing created successfully.').send(res);
});

/** GET /api/marketplace/listings (public/buyer browse, filterable) */
const browseListings = catchAsync(async (req, res) => {
  const { cropName, state, district, page, limit } = req.query;
  const result = await marketplaceModel.listActiveListings({ cropName, state, district, page, limit });
  return new ApiResponse(200, result, 'Listings fetched.').send(res);
});

/** GET /api/marketplace/listings/mine (farmer's own listings) */
const myListings = catchAsync(async (req, res) => {
  const rows = await marketplaceModel.listByFarmer(req.user.id);
  return new ApiResponse(200, rows, 'Your listings fetched.').send(res);
});

/** PATCH /api/marketplace/listings/:id/status */
const updateListingStatus = catchAsync(async (req, res) => {
  const listing = await marketplaceModel.findListingById(req.params.id);
  if (!listing) throw ApiError.notFound('Listing not found.');
  if (listing.farmer_id !== req.user.id) throw ApiError.forbidden('You do not own this listing.');

  const updated = await marketplaceModel.updateListingStatus(req.params.id, req.body.status);
  return new ApiResponse(200, updated, 'Listing status updated.').send(res);
});

// ---------------------- ORDERS (placed by buyers) ----------------------

/** POST /api/marketplace/orders (buyer only) */
const placeOrder = catchAsync(async (req, res) => {
  const { listingId, quantityKg, deliveryAddress } = req.body;
  const listing = await marketplaceModel.findListingById(listingId);
  if (!listing) throw ApiError.notFound('Listing not found.');
  if (listing.status !== 'active') throw ApiError.badRequest('This listing is no longer active.');
  if (Number(quantityKg) > Number(listing.quantity_kg)) {
    throw ApiError.badRequest('Requested quantity exceeds available listing quantity.');
  }

  const order = await marketplaceModel.createOrder(req.user.id, listing, { quantityKg, deliveryAddress });

  await notificationModel.create({
    userId: listing.farmer_id,
    type: 'sale',
    title: 'New Order Received',
    message: `${req.user.full_name} placed an order for ${quantityKg} kg of ${listing.crop_name}.`,
  });

  return new ApiResponse(201, order, 'Order placed successfully.').send(res);
});

/** GET /api/marketplace/orders/mine (buyer's own orders) */
const myOrders = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await marketplaceModel.listOrdersByBuyer(req.user.id, { page, limit });
  return new ApiResponse(200, result, 'Your orders fetched.').send(res);
});

/** GET /api/marketplace/orders/incoming (farmer's incoming orders) */
const incomingOrders = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await marketplaceModel.listOrdersByFarmer(req.user.id, { page, limit });
  return new ApiResponse(200, result, 'Incoming orders fetched.').send(res);
});

/** PATCH /api/marketplace/orders/:id/status (farmer confirms/ships/delivers, buyer cancels) */
const updateOrderStatus = catchAsync(async (req, res) => {
  const order = await marketplaceModel.findOrderById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found.');
  if (order.farmer_id !== req.user.id && order.buyer_id !== req.user.id) {
    throw ApiError.forbidden('You are not part of this order.');
  }

  const updated = await marketplaceModel.updateOrderStatus(req.params.id, req.body.status);

  const notifyUserId = req.user.id === order.farmer_id ? order.buyer_id : order.farmer_id;
  await notificationModel.create({
    userId: notifyUserId,
    type: 'sale',
    title: 'Order Status Updated',
    message: `Your order for ${order.crop_name} is now marked as "${req.body.status}".`,
  });

  return new ApiResponse(200, updated, 'Order status updated.').send(res);
});

module.exports = {
  createListing, browseListings, myListings, updateListingStatus,
  placeOrder, myOrders, incomingOrders, updateOrderStatus,
};

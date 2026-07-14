const express = require('express');
const buyerController = require('../controllers/buyerController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createListingValidator, listingStatusValidator, placeOrderValidator, orderStatusValidator,
} = require('../validators/marketplaceValidator');

const router = express.Router();

router.use(authenticate);

// Listings
router.post('/listings', authorize('farmer'), createListingValidator, validate, buyerController.createListing);
router.get('/listings', buyerController.browseListings);
router.get('/listings/mine', authorize('farmer'), buyerController.myListings);
router.patch('/listings/:id/status', authorize('farmer'), listingStatusValidator, validate, buyerController.updateListingStatus);

// Orders
router.post('/orders', authorize('buyer'), placeOrderValidator, validate, buyerController.placeOrder);
router.get('/orders/mine', authorize('buyer'), buyerController.myOrders);
router.get('/orders/incoming', authorize('farmer'), buyerController.incomingOrders);
router.patch('/orders/:id/status', orderStatusValidator, validate, buyerController.updateOrderStatus);

module.exports = router;

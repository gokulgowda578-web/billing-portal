const express = require('express');
const router = express.Router();
const {
  subscribeToPlan,
  getMySubscription,
  cancelSubscription,
  getAllSubscriptions,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// POST /api/subscriptions - subscribe to a plan (any logged-in user)
router.post('/', subscribeToPlan);

// GET /api/subscriptions/me - get my current subscription
router.get('/me', getMySubscription);

// PUT /api/subscriptions/cancel - cancel my subscription
router.put('/cancel', cancelSubscription);

// GET /api/subscriptions - admin views all subscriptions
router.get('/', authorize('admin'), getAllSubscriptions);

module.exports = router;

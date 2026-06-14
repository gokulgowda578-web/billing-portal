const express = require('express');
const router = express.Router();
const {
  getPlans,
  getAllPlansAdmin,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// GET /api/plans - all logged-in users can view active plans
router.get('/', getPlans);

// GET /api/plans/all - admin can view all plans including inactive
router.get('/all', authorize('admin'), getAllPlansAdmin);

// POST /api/plans - admin only
router.post('/', authorize('admin'), createPlan);

// PUT /api/plans/:id - admin only
router.put('/:id', authorize('admin'), updatePlan);

// DELETE /api/plans/:id - admin only
router.delete('/:id', authorize('admin'), deletePlan);

module.exports = router;

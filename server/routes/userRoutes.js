const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

// GET /api/users - list all users
router.get('/', getAllUsers);

// PUT /api/users/:id/role - change a user's role
router.put('/:id/role', updateUserRole);

module.exports = router;

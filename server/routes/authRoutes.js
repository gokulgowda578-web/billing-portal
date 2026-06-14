const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes (require valid JWT)
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getMyInvoices,
  getAllInvoices,
  getRevenueAnalytics,
  downloadInvoicePdf,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// GET /api/invoices/me - logged-in user's billing history
router.get('/me', getMyInvoices);

// GET /api/invoices/analytics - revenue dashboard (admin & finance)
router.get('/analytics', authorize('admin', 'finance'), getRevenueAnalytics);

// GET /api/invoices - all invoices (admin & finance)
router.get('/', authorize('admin', 'finance'), getAllInvoices);

// GET /api/invoices/:id/pdf - download invoice as PDF (owner, admin, finance)
router.get('/:id/pdf', downloadInvoicePdf);

module.exports = router;

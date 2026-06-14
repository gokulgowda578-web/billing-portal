const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');

// @desc    Get logged-in user's invoices (billing history)
// @route   GET /api/invoices/me
// @access  Private (User)
const getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all invoices (Admin / Finance)
// @route   GET /api/invoices
// @access  Private/Admin/Finance
const getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate('userId', 'name email')
      .sort({ date: -1 });

    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue dashboard analytics (Admin / Finance)
// @route   GET /api/invoices/analytics
// @access  Private/Admin/Finance
const getRevenueAnalytics = async (req, res, next) => {
  try {
    const invoices = await Invoice.find({ status: 'paid' });

    // Total revenue from all paid invoices
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Group revenue by plan name
    const revenueByPlan = {};
    invoices.forEach((inv) => {
      revenueByPlan[inv.planName] = (revenueByPlan[inv.planName] || 0) + inv.amount;
    });

    // Group revenue by month (YYYY-MM)
    const revenueByMonth = {};
    invoices.forEach((inv) => {
      const monthKey = inv.date.toISOString().slice(0, 7); // e.g. "2026-06"
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + inv.amount;
    });

    res.json({
      totalRevenue,
      totalInvoices: invoices.length,
      revenueByPlan,
      revenueByMonth,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download a single invoice as a PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private (owner, admin, or finance)
const downloadInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('userId', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Authorization check: only the owner, admin, or finance can download
    const isOwner = invoice.userId._id.toString() === req.user._id.toString();
    const isPrivileged = ['admin', 'finance'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice._id}.pdf`);

    // Create PDF document and pipe it directly to the response
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // --- PDF Content ---
    doc.fontSize(20).text('SaaS Billing Portal', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Invoice', { align: 'center' });
    doc.moveDown(2);

    doc.fontSize(12);
    doc.text(`Invoice ID: ${invoice._id}`);
    doc.text(`Date: ${new Date(invoice.date).toLocaleDateString()}`);
    doc.text(`Customer: ${invoice.userId.name} (${invoice.userId.email})`);
    doc.moveDown();

    doc.text(`Plan: ${invoice.planName}`);
    doc.text(`Billing Cycle: ${invoice.billingCycle}`);
    doc.text(`Amount: $${invoice.amount.toFixed(2)}`);
    doc.text(`Status: ${invoice.status.toUpperCase()}`);
    doc.moveDown(2);

    doc.fontSize(10).fillColor('gray').text(
      'This is a system-generated invoice from the SaaS Billing Portal (mock payment gateway).',
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyInvoices,
  getAllInvoices,
  getRevenueAnalytics,
  downloadInvoicePdf,
};

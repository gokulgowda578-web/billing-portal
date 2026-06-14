const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Invoice = require('../models/Invoice');

// Helper: calculate end date based on billing cycle
const calculateEndDate = (startDate, billingCycle) => {
  const end = new Date(startDate);
  if (billingCycle === 'yearly') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
};

// @desc    Subscribe to a plan (creates subscription + invoice)
// @route   POST /api/subscriptions
// @access  Private (User)
const subscribeToPlan = async (req, res, next) => {
  try {
    const { planId, billingCycle } = req.body;

    if (!planId) {
      return res.status(400).json({ message: 'planId is required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Plan not found or inactive' });
    }

    const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';

    // Cancel any existing active subscription before creating a new one
    await Subscription.updateMany(
      { userId: req.user._id, status: 'active' },
      { $set: { status: 'cancelled' } }
    );

    const startDate = new Date();
    const endDate = calculateEndDate(startDate, cycle);

    const subscription = await Subscription.create({
      userId: req.user._id,
      planId: plan._id,
      billingCycle: cycle,
      status: 'active',
      startDate,
      endDate,
    });

    // Determine amount based on billing cycle
    const amount = cycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

    // Generate an invoice for this subscription (mock payment - auto "paid")
    const invoice = await Invoice.create({
      userId: req.user._id,
      subscriptionId: subscription._id,
      planName: plan.name,
      amount,
      billingCycle: cycle,
      status: 'paid', // Mock payment gateway always succeeds
      date: new Date(),
    });

    res.status(201).json({ subscription, invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's current subscription
// @route   GET /api/subscriptions/me
// @access  Private (User)
const getMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
    }).populate('planId', 'name priceMonthly priceYearly features');

    res.json(subscription); // null if no active subscription
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel logged-in user's active subscription
// @route   PUT /api/subscriptions/cancel
// @access  Private (User)
const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active',
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({ message: 'Subscription cancelled successfully', subscription });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subscriptions (Admin)
// @route   GET /api/subscriptions
// @access  Private/Admin
const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('userId', 'name email')
      .populate('planId', 'name priceMonthly priceYearly')
      .sort({ createdAt: -1 });

    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribeToPlan,
  getMySubscription,
  cancelSubscription,
  getAllSubscriptions,
};

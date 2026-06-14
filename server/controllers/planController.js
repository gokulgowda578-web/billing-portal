const Plan = require('../models/Plan');

// @desc    Get all active plans (visible to all logged-in users)
// @route   GET /api/plans
// @access  Private
const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ priceMonthly: 1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all plans including inactive ones (Admin only)
// @route   GET /api/plans/all
// @access  Private/Admin
const getAllPlansAdmin = async (req, res, next) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = async (req, res, next) => {
  try {
    const { name, priceMonthly, priceYearly, features, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Plan name is required' });
    }

    const plan = await Plan.create({
      name,
      priceMonthly: priceMonthly || 0,
      priceYearly: priceYearly || 0,
      features: features || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Update only the fields provided in the request body
    const { name, priceMonthly, priceYearly, features, isActive } = req.body;

    if (name !== undefined) plan.name = name;
    if (priceMonthly !== undefined) plan.priceMonthly = priceMonthly;
    if (priceYearly !== undefined) plan.priceYearly = priceYearly;
    if (features !== undefined) plan.features = features;
    if (isActive !== undefined) plan.isActive = isActive;

    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    await plan.deleteOne();
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlans, getAllPlansAdmin, createPlan, updatePlan, deletePlan };

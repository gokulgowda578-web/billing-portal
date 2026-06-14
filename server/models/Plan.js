const mongoose = require('mongoose');

// Subscription Plan schema - managed by Admin
const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    // Price for monthly billing (in smallest currency unit, e.g. dollars here)
    priceMonthly: {
      type: Number,
      required: true,
      default: 0,
    },
    // Price for yearly billing
    priceYearly: {
      type: Number,
      required: true,
      default: 0,
    },
    // List of feature strings shown on pricing cards
    features: {
      type: [String],
      default: [],
    },
    // Whether the plan is currently offered to users
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);

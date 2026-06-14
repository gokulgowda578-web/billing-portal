const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Plan = require('../models/Plan');

dotenv.config();

// Seed script: creates an admin user, a finance user, and sample plans.
// Run with: npm run seed
const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // --- Seed Admin User ---
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@billingportal.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
    } else {
      console.log('Admin user already exists, skipping.');
    }

    // --- Seed Finance User (sample) ---
    const financeEmail = 'finance@billingportal.com';
    const existingFinance = await User.findOne({ email: financeEmail });
    if (!existingFinance) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Finance@123', salt);

      await User.create({
        name: 'Finance User',
        email: financeEmail,
        password: hashedPassword,
        role: 'finance',
      });
      console.log(`Finance user created: ${financeEmail} / Finance@123`);
    } else {
      console.log('Finance user already exists, skipping.');
    }

    // --- Seed Sample Plans ---
    const planCount = await Plan.countDocuments();
    if (planCount === 0) {
      await Plan.insertMany([
        {
          name: 'Free',
          priceMonthly: 0,
          priceYearly: 0,
          features: ['1 Project', 'Community Support', 'Basic Analytics'],
          isActive: true,
        },
        {
          name: 'Basic',
          priceMonthly: 9.99,
          priceYearly: 99.99,
          features: ['5 Projects', 'Email Support', 'Standard Analytics', 'Daily Backups'],
          isActive: true,
        },
        {
          name: 'Pro',
          priceMonthly: 29.99,
          priceYearly: 299.99,
          features: [
            'Unlimited Projects',
            'Priority Support',
            'Advanced Analytics',
            'Hourly Backups',
            'Team Collaboration',
          ],
          isActive: true,
        },
      ]);
      console.log('Sample plans created: Free, Basic, Pro');
    } else {
      console.log('Plans already exist, skipping.');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();

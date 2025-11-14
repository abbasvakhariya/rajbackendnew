import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = 'abbasvakhariya00@gmail.com';
    
    // Check if user exists
    let user = await User.findOne({ email: adminEmail });

    if (user) {
      // Update existing user to admin with lifetime access
      user.role = 'admin';
      user.subscriptionStatus = 'active';
      user.subscriptionTier = 'enterprise';
      user.subscriptionStartDate = new Date();
      // Set subscription end date to 100 years from now (lifetime)
      const lifetimeDate = new Date();
      lifetimeDate.setFullYear(lifetimeDate.getFullYear() + 100);
      user.subscriptionEndDate = lifetimeDate;
      user.isEmailVerified = true;
      
      await user.save();
      console.log(`✅ Updated user ${adminEmail} to admin with lifetime access`);
    } else {
      // Create new admin user
      const lifetimeDate = new Date();
      lifetimeDate.setFullYear(lifetimeDate.getFullYear() + 100);
      
      user = await User.create({
        email: adminEmail,
        password: 'Admin@123', // Default password - should be changed
        fullName: 'Admin User',
        companyName: 'Raj Windows',
        role: 'admin',
        subscriptionStatus: 'active',
        subscriptionTier: 'enterprise',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: lifetimeDate,
        isEmailVerified: true
      });
      
      console.log(`✅ Created admin user ${adminEmail} with lifetime access`);
      console.log(`⚠️  Default password: Admin@123 - Please change this after first login!`);
    }

    console.log('\n📋 Admin User Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Subscription: ${user.subscriptionStatus} (${user.subscriptionTier})`);
    console.log(`   End Date: ${user.subscriptionEndDate.toLocaleDateString()}`);
    console.log(`   Email Verified: ${user.isEmailVerified}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
};

setupAdmin();


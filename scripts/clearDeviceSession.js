// Quick script to clear device session for a user
// Usage: node scripts/clearDeviceSession.js <email>

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://abbas:abbas123@abbas.tdhnt9r.mongodb.net/windows-management-system?retryWrites=true&w=majority&appName=abbas';

async function clearDeviceSession(email) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found:', email);
      process.exit(1);
    }

    // Clear both deviceId and currentDevice
    user.deviceId = undefined;
    user.currentDevice = undefined;
    await user.save();

    console.log(`✅ Device session cleared successfully for ${email}`);
    console.log('   You can now login from any device.');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node scripts/clearDeviceSession.js <email>');
  console.log('Example: node scripts/clearDeviceSession.js abbasvakhariya00@gmail.com');
  process.exit(1);
}

clearDeviceSession(email);


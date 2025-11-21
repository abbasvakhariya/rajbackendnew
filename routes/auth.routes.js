import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
// OTP functionality removed - using password login instead
// import { sendOTP, generateOTP } from '../utils/email.js';

const router = express.Router();

// Helper to check MongoDB connection
const checkMongoConnection = (req, res, next) => {
  const mongoState = mongoose.connection.readyState;
  if (mongoState !== 1) {
    const states = {
      0: 'disconnected',
      2: 'connecting',
      3: 'disconnecting'
    };
    console.error('❌ MongoDB connection check failed. State:', states[mongoState] || 'unknown');
    return res.status(503).json({
      success: false,
      message: `Database connection unavailable (${states[mongoState] || 'unknown'}). Please try again later.`,
      error: 'MongoDB not connected',
      state: mongoState
    });
  }
  next();
};

// Register
router.post('/register', checkMongoConnection, async (req, res) => {
  try {
    const { email, password, fullName, companyName, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but not verified, auto-verify and allow login
      if (!existingUser.isEmailVerified) {
        existingUser.isEmailVerified = true;
        await existingUser.save();
      }
      
      // Generate token for existing user (auto-login)
      const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_SECRET || 'default-secret-key-change-in-production',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      return res.status(200).json({
        success: true,
        message: 'You already have an account. Logged in successfully.',
        token,
        user: {
          _id: existingUser._id,
          email: existingUser.email,
          fullName: existingUser.fullName,
          companyName: existingUser.companyName,
          phone: existingUser.phone,
          role: existingUser.role,
          subscriptionStatus: existingUser.subscriptionStatus,
          subscriptionTier: existingUser.subscriptionTier,
          subscriptionEndDate: existingUser.subscriptionEndDate
        }
      });
    }

    // Create user with email auto-verified
    const user = await User.create({
      email,
      password,
      fullName,
      companyName: companyName || '',
      phone: phone || '',
      isEmailVerified: true
    });

    // Auto-login after registration - generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful. You are now logged in.',
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        phone: user.phone,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: user.subscriptionTier,
        subscriptionEndDate: user.subscriptionEndDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// OTP route removed - using password-based login only

// Login with Password
router.post('/login', checkMongoConnection, async (req, res) => {
  try {
    const { email, password, deviceId, forceLogout, logoutOtherDevices } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user - need to explicitly select password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Auto-verify email if not verified (for existing users or if verification was skipped)
    // This ensures all users can login without email verification
    if (!user.isEmailVerified) {
      try {
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
        console.log(`✅ Auto-verified email for user: ${email}`);
      } catch (saveError) {
        console.error('Error auto-verifying email:', saveError);
        // Continue with login even if save fails - we'll try to update it
        // Use updateOne as fallback
        try {
          await User.updateOne({ _id: user._id }, { isEmailVerified: true });
        } catch (updateError) {
          console.error('Error updating email verification:', updateError);
          // Still continue - don't block login
        }
      }
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // If forceLogout is true, clear device before checking
    if (forceLogout || logoutOtherDevices) {
      user.deviceId = undefined;
      user.currentDevice = undefined;
      await user.save();
    }

    // Check device conflict (only if not forcing logout)
    if (!forceLogout && !logoutOtherDevices && deviceId && user.deviceId && user.deviceId !== deviceId) {
      return res.status(409).json({
        success: false,
        code: 'DEVICE_CONFLICT',
        message: 'Another device is already logged in. Please logout from other device first.',
        deviceConflict: true
      });
    }

    // Update device ID
    if (deviceId) {
      user.deviceId = deviceId;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        phone: user.phone,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionTier: user.subscriptionTier,
        subscriptionEndDate: user.subscriptionEndDate
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed. Please try again.'
    });
  }
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    req.user.deviceId = null;
    await req.user.save();

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get Current User
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        _id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        companyName: req.user.companyName,
        phone: req.user.phone,
        role: req.user.role,
        subscriptionStatus: req.user.subscriptionStatus,
        subscriptionTier: req.user.subscriptionTier,
        subscriptionStartDate: req.user.subscriptionStartDate,
        subscriptionEndDate: req.user.subscriptionEndDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;


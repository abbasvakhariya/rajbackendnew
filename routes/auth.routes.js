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
      return res.status(400).json({
        success: false,
        message: 'User already exists'
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

// Request Login OTP
router.post('/request-login-otp', checkMongoConnection, async (req, res) => {
  try {
    const { email } = req.body;

    console.log('📧 OTP request received for email:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email configuration is set (allow development mode)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const emailConfigured = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;
    
    if (!emailConfigured && !isDevelopment) {
      console.error('Email configuration missing:', {
        EMAIL_HOST: !!process.env.EMAIL_HOST,
        EMAIL_USER: !!process.env.EMAIL_USER,
        EMAIL_PASS: !!process.env.EMAIL_PASS
      });
      return res.status(500).json({
        success: false,
        message: 'Email service is not configured. Please contact administrator.'
      });
    }

    console.log('🔍 Searching for user with email:', email);
    let user;
    try {
      user = await User.findOne({ email }).select('+loginOTP +loginOTPExpiry');
      console.log('👤 User found:', user ? 'Yes' : 'No');
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error while searching for user. Please try again later.'
      });
    }
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({
        success: false,
        message: 'User not found. Please register first.'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Generate login OTP
    const loginOTP = generateOTP();
    user.loginOTP = loginOTP;
    user.loginOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    try {
      await user.save();
      console.log('✅ OTP saved for user:', email);
    } catch (saveError) {
      console.error('Error saving OTP:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Error saving OTP. Please try again later.'
      });
    }

    // Send OTP via email (or log in development)
    if (emailConfigured) {
      console.log('📨 Sending OTP email to:', email);
      const emailSent = await sendOTP(email, loginOTP, 'login');
      
      if (!emailSent) {
        // In development, still return success but log OTP
        if (isDevelopment) {
          console.log('⚠️  Email sending failed, but in development mode. OTP:', loginOTP);
          return res.json({
            success: true,
            message: `OTP generated (development mode): ${loginOTP}`,
            otp: loginOTP // Only in development
          });
        }
        return res.status(500).json({
          success: false,
        message: 'Failed to send OTP email. Please check email configuration or try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Login OTP sent to your email'
    });
    } else {
      // Development mode: log OTP to console
      console.log('⚠️  DEVELOPMENT MODE: Email not configured. OTP for', email, ':', loginOTP);
      res.json({
        success: true,
        message: `OTP generated (check server logs): ${loginOTP}`,
        otp: loginOTP // Only in development
      });
    }
  } catch (error) {
    console.error('Request login OTP error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more specific error messages
    let errorMessage = 'Server error. Please try again later.';
    
    if (error.name === 'MongoServerError' || error.name === 'MongoError') {
      errorMessage = 'Database error. Please try again later.';
    } else if (error.name === 'ValidationError') {
      errorMessage = error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

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


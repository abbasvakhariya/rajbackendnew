import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { sendOTP, generateOTP } from '../utils/email.js';

const router = express.Router();

// Helper to check MongoDB connection
const checkMongoConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again later.',
      error: 'MongoDB not connected'
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

    res.status(201).json({
      success: true,
      message: 'Registration successful. You can now login.',
      userId: user._id
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

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email configuration is set
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
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

    const user = await User.findOne({ email }).select('+loginOTP +loginOTPExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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
    await user.save();

    // Send OTP via email
    const emailSent = await sendOTP(email, loginOTP, 'login');
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check email configuration or try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Login OTP sent to your email'
    });
  } catch (error) {
    console.error('Request login OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error. Please try again later.'
    });
  }
});

// Login with OTP
router.post('/login', checkMongoConnection, async (req, res) => {
  try {
    const { email, otp, deviceId } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({ email }).select('+loginOTP +loginOTPExpiry');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or OTP'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    // Verify OTP
    if (!user.loginOTP || user.loginOTP !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP has expired
    if (new Date() > user.loginOTPExpiry) {
      return res.status(401).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Clear OTP after successful verification
    user.loginOTP = null;
    user.loginOTPExpiry = null;

    // Check device conflict
    if (deviceId && user.deviceId && user.deviceId !== deviceId) {
      return res.status(409).json({
        success: false,
        code: 'DEVICE_CONFLICT',
        message: 'Another device is already logged in'
      });
    }

    // Update device ID
    if (deviceId) {
      user.deviceId = deviceId;
    }
    
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
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
      message: error.message
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


import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

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

// Login
router.post('/login', checkMongoConnection, async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
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

    // Check device conflict (optional - can be removed if not needed)
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
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
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


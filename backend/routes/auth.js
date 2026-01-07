const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendOTP, generateOTP } = require('../utils/email');
const { protect, checkDevice } = require('../middleware/auth');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, password, fullName, companyName, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate email verification OTP
    const emailOTP = generateOTP();
    const emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      email,
      password,
      fullName,
      companyName: companyName || '',
      phone: phone || '',
      emailVerificationOTP: emailOTP,
      emailVerificationOTPExpiry: emailOTPExpiry,
      subscriptionTier: 'trial',
      subscriptionStatus: 'trial',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    });

    // Send verification email
    await sendOTP(email, emailOTP, 'verification');

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email with OTP.',
      userId: user._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/verify-email
// @desc    Email verification no longer required - OTP removed
// @access  Public
router.post('/verify-email', [
  body('email').isEmail().normalizeEmail(),
  body('otp').optional()
], async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Email verification is no longer required. Your email is automatically verified on registration.'
  });
});

// @route   POST /api/auth/resend-otp
// @desc    OTP functionality removed - email verification no longer required
// @access  Public
router.post('/resend-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'OTP functionality is no longer supported. Email verification is automatic.'
  });
});

// @route   POST /api/auth/request-login-otp
// @desc    OTP functionality removed - use password login instead
// @access  Public
router.post('/request-login-otp', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'OTP login is no longer supported. Please use password-based login.'
  });
});

// @route   POST /api/auth/login
// @desc    Login with Password (OTP removed)
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('deviceId').optional()
], async (req, res) => {
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

    // Auto-verify email if not verified
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save({ validateBeforeSave: false });
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

    // Check if another device is logged in
    // Only block if:
    // 1. currentDevice exists AND has a valid deviceId
    // 2. The deviceId is different from the current request
    // 3. The last login was recent (within 24 hours)
    
    // Clear invalid/empty device objects
    if (user.currentDevice && !user.currentDevice.deviceId) {
      user.currentDevice = undefined;
      await user.save();
    }
    
    if (user.currentDevice && 
        user.currentDevice.deviceId && 
        user.currentDevice.deviceId !== deviceId &&
        user.currentDevice.lastLogin) {
      const lastLoginTime = new Date(user.currentDevice.lastLogin);
      const hoursSinceLastLogin = (new Date() - lastLoginTime) / (1000 * 60 * 60);
      
      // Only block if last login was within 24 hours
      if (hoursSinceLastLogin < 24) {
        return res.status(403).json({
          success: false,
          message: 'Another device is already logged in. Please logout from other device first.',
          code: 'DEVICE_CONFLICT'
        });
      }
      // If last login was more than 24 hours ago, allow the new login (old session expired)
    }

    // Check subscription status
    const now = new Date();
    if (user.subscriptionEndDate < now && user.subscriptionStatus === 'trial') {
      user.subscriptionStatus = 'expired';
      await user.save();
    }

    // Update device info
    user.currentDevice = {
      deviceId: deviceId,
      deviceInfo: req.headers['user-agent'] || 'Unknown',
      lastLogin: new Date()
    };
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, checkDevice, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.currentDevice = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   POST /api/auth/force-logout
// @desc    Force logout from all devices (OTP removed - use password login with forceLogout flag)
// @access  Public
router.post('/force-logout', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Clear device session
    user.deviceId = undefined;
    user.currentDevice = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Device session cleared. You can now login from any device.'
    });
  } catch (error) {
    console.error('Force logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, checkDevice, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        phone: user.phone,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/google
// @desc    Login/Register with Google OAuth
// @access  Public
router.post('/google', [
  body('token').optional(),
  body('code').optional(),
  body('deviceId').optional()
], async (req, res) => {
  try {
    const { token: googleToken, code, deviceId } = req.body;

    let ticket;
    
    // Handle both idToken and authorization code
    if (googleToken) {
      // Verify Google idToken
      ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } else if (code) {
      // Exchange authorization code for tokens
      const redirectUri = process.env.FRONTEND_URL || 'http://localhost:5173';
      const { tokens } = await googleClient.getToken({
        code,
        redirect_uri: redirectUri
      });
      ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Google token or code is required'
      });
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not provided by Google'
      });
    }

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { googleId: googleId }
      ]
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.googleEmail = email;
        if (!user.isEmailVerified) {
          user.isEmailVerified = true;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email: email.toLowerCase(),
        fullName: name || email.split('@')[0],
        googleId: googleId,
        googleEmail: email,
        isEmailVerified: true,
        subscriptionTier: 'trial',
        subscriptionStatus: 'trial',
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
      });
    }

    // Update device info
    if (deviceId) {
      user.deviceId = deviceId;
    }

    user.currentDevice = {
      deviceId: deviceId,
      deviceInfo: req.headers['user-agent'] || 'Unknown',
      lastLogin: new Date()
    };
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

module.exports = router;


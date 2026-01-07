const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Window = require('../models/Window');
const Settings = require('../models/Settings');
const { protect, isAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(isAdmin);

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.subscriptionStatus = status;
    }

    const users = await User.find(query)
      .select('-password -emailVerificationOTP -loginOTP')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -emailVerificationOTP -loginOTP');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const subscriptions = await Subscription.find({ userId: user._id }).sort({ createdAt: -1 });
    const windowsCount = await Window.countDocuments({ userId: user._id });

    res.json({
      success: true,
      user,
      subscriptions,
      windowsCount
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin)
// @access  Admin
router.put('/users/:id', async (req, res) => {
  try {
    const { subscriptionTier, subscriptionStatus, subscriptionEndDate, isActive } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (subscriptionTier) user.subscriptionTier = subscriptionTier;
    if (subscriptionStatus) user.subscriptionStatus = subscriptionStatus;
    if (subscriptionEndDate) user.subscriptionEndDate = new Date(subscriptionEndDate);
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete related data
    await Window.deleteMany({ userId: user._id });
    await Settings.deleteOne({ userId: user._id });
    await Subscription.deleteMany({ userId: user._id });
    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/stats
// @desc    Get admin dashboard stats
// @access  Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ subscriptionStatus: 'active' });
    const trialUsers = await User.countDocuments({ subscriptionStatus: 'trial' });
    const expiredUsers = await User.countDocuments({ subscriptionStatus: 'expired' });
    const totalWindows = await Window.countDocuments();
    const totalSubscriptions = await Subscription.countDocuments({ status: 'active' });

    // Revenue calculation
    const activeSubscriptions = await Subscription.find({ status: 'active' });
    const totalRevenue = activeSubscriptions.reduce((sum, sub) => sum + sub.price, 0);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        trialUsers,
        expiredUsers,
        totalWindows,
        totalSubscriptions,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/subscriptions
// @desc    Get all subscriptions
// @access  Admin
router.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('userId', 'email fullName companyName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users/create
// @desc    Create new user (admin)
// @access  Admin
router.post('/users/create', async (req, res) => {
  try {
    const { email, password, fullName, companyName, phone, subscriptionTier, subscriptionStatus, subscriptionEndDate } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: password || 'TempPassword123!',
      fullName,
      companyName: companyName || '',
      phone: phone || '',
      isEmailVerified: true,
      subscriptionTier: subscriptionTier || 'trial',
      subscriptionStatus: subscriptionStatus || 'trial',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: subscriptionEndDate ? new Date(subscriptionEndDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    res.json({
      success: true,
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   POST /api/admin/clear-device/:userId
// @desc    Clear device session for a user (admin only)
// @access  Private/Admin
router.post('/clear-device/:userId', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.currentDevice = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Device session cleared successfully'
    });
  } catch (error) {
    console.error('Clear device error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/plans
// @desc    Get all subscription plans
// @access  Admin
router.get('/plans', async (req, res) => {
  try {
    const SystemSettings = require('../models/SystemSettings');
    let plans = await SystemSettings.findOne({ key: 'subscription_plans' });
    
    if (!plans || !plans.value) {
      // Default plans
      const defaultPlans = {
        '1_month': { price: 460, duration: 1, billingCycle: 'monthly', name: '1 Month' },
        '3_months': { price: 1250, duration: 3, billingCycle: 'quarterly', name: '3 Months' },
        '6_months': { price: 2200, duration: 6, billingCycle: 'semi_annual', name: '6 Months' },
        '12_months': { price: 4000, duration: 12, billingCycle: 'annual', name: '12 Months' }
      };
      return res.json({
        success: true,
        plans: defaultPlans
      });
    }

    res.json({
      success: true,
      plans: plans.value
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/plans
// @desc    Update subscription plans
// @access  Admin
router.put('/plans', async (req, res) => {
  try {
    const { plans } = req.body;
    const SystemSettings = require('../models/SystemSettings');
    
    await SystemSettings.findOneAndUpdate(
      { key: 'subscription_plans' },
      { 
        key: 'subscription_plans',
        value: plans,
        type: 'object',
        category: 'subscription',
        updatedBy: req.user._id
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Plans updated successfully',
      plans
    });
  } catch (error) {
    console.error('Update plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users/:id/extend-trial
// @desc    Extend user trial period
// @access  Admin
router.post('/users/:id/extend-trial', async (req, res) => {
  try {
    const { days } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!days || days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid number of days is required'
      });
    }

    // Extend trial
    const currentEndDate = new Date(user.subscriptionEndDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + parseInt(days));
    
    user.subscriptionEndDate = newEndDate;
    if (user.subscriptionStatus === 'expired') {
      user.subscriptionStatus = 'trial';
    }
    await user.save();

    res.json({
      success: true,
      message: `Trial extended by ${days} days`,
      user: {
        subscriptionEndDate: user.subscriptionEndDate,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error('Extend trial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users/:id/grant-subscription
// @desc    Grant subscription to user
// @access  Admin
router.post('/users/:id/grant-subscription', async (req, res) => {
  try {
    const { tier, months } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!tier || !months) {
      return res.status(400).json({
        success: false,
        message: 'Tier and months are required'
      });
    }

    // Grant subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(months));
    
    user.subscriptionTier = tier;
    user.subscriptionStatus = 'active';
    user.subscriptionStartDate = startDate;
    user.subscriptionEndDate = endDate;
    await user.save();

    res.json({
      success: true,
      message: `Subscription granted: ${tier} for ${months} months`,
      user: {
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionEndDate: user.subscriptionEndDate
      }
    });
  } catch (error) {
    console.error('Grant subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users/:id/reset-password
// @desc    Reset user password
// @access  Admin
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/subscriptions/:id
// @desc    Update subscription
// @access  Admin
router.put('/subscriptions/:id', async (req, res) => {
  try {
    const { status, planType, startDate, endDate } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (status) subscription.status = status;
    if (planType) subscription.planType = planType;
    if (startDate) subscription.startDate = new Date(startDate);
    if (endDate) subscription.endDate = new Date(endDate);
    
    await subscription.save();

    // Update user subscription if status is active
    if (status === 'active' && subscription.userId) {
      const user = await User.findById(subscription.userId);
      if (user) {
        user.subscriptionTier = subscription.planType;
        user.subscriptionStatus = 'active';
        user.subscriptionStartDate = subscription.startDate;
        user.subscriptionEndDate = subscription.endDate;
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/subscriptions/:id/cancel
// @desc    Cancel subscription
// @access  Admin
router.post('/subscriptions/:id/cancel', async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    // Update user subscription status
    if (subscription.userId) {
      const user = await User.findById(subscription.userId);
      if (user) {
        user.subscriptionStatus = 'cancelled';
        await user.save();
      }
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users/:id/settings
// @desc    Get user settings
// @access  Admin
router.get('/users/:id/settings', async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    
    const settings = await Settings.findOne({ userId: req.params.id });

    res.json({
      success: true,
      settings: settings?.toolSettings || null
    });
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/users/:id/rates
// @desc    Get user rates
// @access  Admin
router.get('/users/:id/rates', async (req, res) => {
  try {
    const RateConfiguration = require('../models/RateConfiguration');
    let rates = await RateConfiguration.findOne({ userId: req.params.id });

    // If no rates exist, return default rates
    if (!rates) {
      rates = {
        materialPerKg: 345,
        coatingPerKg: 60,
        glassPlane: 45,
        glassReflective: 75,
        lockPerTrack: 100,
        bearingPerUnit: 20,
        clampPerUnit: 20,
        glassRubberPerFeet: 8,
        woolfilePerFeet: 2,
        labourPerSqft: 50,
        fixedCharge: 30,
        mosquitoNetPerSqft: 20,
        brightBarPerUnit: 2.25,
        coverPerUnit: 1
      };
    }

    res.json({
      success: true,
      rates: rates
    });
  } catch (error) {
    console.error('Get user rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/settings
// @desc    Update user settings
// @access  Admin
router.put('/users/:id/settings', async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const { settings, notifyUser } = req.body;

    let userSettings = await Settings.findOne({ userId: req.params.id });
    
    if (!userSettings) {
      userSettings = await Settings.create({
        userId: req.params.id,
        toolSettings: settings
      });
    } else {
      userSettings.toolSettings = settings;
      await userSettings.save();
    }

    // Send notification if requested
    if (notifyUser) {
      const user = await User.findById(req.params.id);
      if (user && user.email) {
        const { sendOTP } = require('../utils/email');
        try {
          await sendOTP(user.email, 'Your tool settings have been updated by the administrator.', 'notification', 'Settings Updated');
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: userSettings.toolSettings
    });
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/rates
// @desc    Update user rates
// @access  Admin
router.put('/users/:id/rates', async (req, res) => {
  try {
    const RateConfiguration = require('../models/RateConfiguration');
    const { rates, notifyUser } = req.body;

    let userRates = await RateConfiguration.findOne({ userId: req.params.id });
    
    if (!userRates) {
      userRates = await RateConfiguration.create({
        userId: req.params.id,
        ...rates
      });
    } else {
      Object.assign(userRates, rates);
      await userRates.save();
    }

    // Send notification if requested
    if (notifyUser) {
      const user = await User.findById(req.params.id);
      if (user && user.email) {
        const { sendOTP } = require('../utils/email');
        try {
          await sendOTP(user.email, 'Your rates have been updated by the administrator.', 'notification', 'Rates Updated');
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }
    }

    res.json({
      success: true,
      message: 'Rates updated successfully',
      rates: userRates
    });
  } catch (error) {
    console.error('Update user rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/admin/users/:id/settings-and-rates
// @desc    Update user settings and rates together
// @access  Admin
router.put('/users/:id/settings-and-rates', async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const RateConfiguration = require('../models/RateConfiguration');
    const { settings, rates, notifyUser } = req.body;

    // Update settings
    let userSettings = await Settings.findOne({ userId: req.params.id });
    if (!userSettings) {
      userSettings = await Settings.create({
        userId: req.params.id,
        toolSettings: settings
      });
    } else {
      userSettings.toolSettings = settings;
      await userSettings.save();
    }

    // Update rates
    let userRates = await RateConfiguration.findOne({ userId: req.params.id });
    if (!userRates) {
      userRates = await RateConfiguration.create({
        userId: req.params.id,
        ...rates
      });
    } else {
      Object.assign(userRates, rates);
      await userRates.save();
    }

    // Send notification if requested
    if (notifyUser) {
      const user = await User.findById(req.params.id);
      if (user && user.email) {
        const { sendOTP } = require('../utils/email');
        try {
          await sendOTP(user.email, 'Your settings and rates have been updated by the administrator.', 'notification', 'Settings & Rates Updated');
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }
    }

    res.json({
      success: true,
      message: 'Settings and rates updated successfully',
      settings: userSettings.toolSettings,
      rates: userRates
    });
  } catch (error) {
    console.error('Update settings and rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/users/:id/settings/reset
// @desc    Reset user settings to default
// @access  Admin
router.post('/users/:id/settings/reset', async (req, res) => {
  try {
    const Settings = require('../models/Settings');
    const RateConfiguration = require('../models/RateConfiguration');
    const { notifyUser } = req.body;

    // Reset to default settings
    const defaultSettings = {
      windowCosting: {
        miniDomal: {
          outerFrameKg: 0.200,
          shutterFrameKg: 0.175,
          innerLockClipKg: 0.0625,
          cChannelKg: 0.0625,
          rtKg: 0.125,
          roundPipeKg: 0.0625,
          outerFrameKgWithNet: 0.26875,
          outerFrameKgWithGrill: 0.2625,
          cuttingProfiles: {
            '2_track': '',
            '2_track_mosquito': '',
            '2_track_grill': '',
            '2_track_mosquito_grill': ''
          }
        },
        domal: {
          outerFrameKg: 0.250,
          shutterFrameKg: 0.200,
          innerLockClipKg: 0.0750,
          cChannelKg: 0.0750,
          rtKg: 0.150,
          roundPipeKg: 0.0750,
          outerFrameKgWithNet: 0.300,
          outerFrameKgWithGrill: 0.290,
          cuttingProfiles: {
            '2_track': '',
            '2_track_mosquito': '',
            '2_track_grill': '',
            '2_track_mosquito_grill': ''
          }
        },
        ventena: {
          outerFrameKg: 0.180,
          shutterFrameKg: 0.160,
          innerLockClipKg: 0.0500,
          cChannelKg: 0.0500,
          rtKg: 0.100,
          roundPipeKg: 0.0500,
          outerFrameKgWithNet: 0.240,
          outerFrameKgWithGrill: 0.230,
          cuttingProfiles: {
            '2_track': '',
            '2_track_mosquito': '',
            '2_track_grill': '',
            '2_track_mosquito_grill': ''
          }
        }
      },
      doorCosting: {
        standard: {
          frameKg: 0.300,
          shutterKg: 0.250,
          hingesWeight: 0.150,
          lockWeight: 0.200
        }
      },
      cuttingMeasuring: {
        profiles: {}
      },
      customCategories: {
        sliding: {},
        openable: {}
      }
    };

    const defaultRates = {
      materialPerKg: 345,
      coatingPerKg: 60,
      glassPlane: 45,
      glassReflective: 75,
      lockPerTrack: 100,
      bearingPerUnit: 20,
      clampPerUnit: 20,
      glassRubberPerFeet: 8,
      woolfilePerFeet: 2,
      labourPerSqft: 50,
      fixedCharge: 30,
      mosquitoNetPerSqft: 20,
      brightBarPerUnit: 2.25,
      coverPerUnit: 1
    };

    let userSettings = await Settings.findOne({ userId: req.params.id });
    if (!userSettings) {
      userSettings = await Settings.create({
        userId: req.params.id,
        toolSettings: defaultSettings
      });
    } else {
      userSettings.toolSettings = defaultSettings;
      await userSettings.save();
    }

    let userRates = await RateConfiguration.findOne({ userId: req.params.id });
    if (!userRates) {
      userRates = await RateConfiguration.create({
        userId: req.params.id,
        ...defaultRates
      });
    } else {
      Object.assign(userRates, defaultRates);
      await userRates.save();
    }

    // Send notification if requested
    if (notifyUser) {
      const user = await User.findById(req.params.id);
      if (user && user.email) {
        const { sendOTP } = require('../utils/email');
        try {
          await sendOTP(user.email, 'Your settings have been reset to default by the administrator.', 'notification', 'Settings Reset');
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
        }
      }
    }

    res.json({
      success: true,
      message: 'Settings reset to default successfully',
      settings: userSettings.toolSettings,
      rates: userRates
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/admin/notifications/send
// @desc    Send notification to users
// @access  Admin
router.post('/notifications/send', async (req, res) => {
  try {
    const { userIds, title, message, category } = req.body;
    const Notification = require('../models/Notification');
    const { sendOTP } = require('../utils/email');

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs are required'
      });
    }

    // Create in-app notifications
    const notifications = userIds.map(userId => ({
      userId,
      type: 'in_app',
      title,
      message,
      category: category || 'announcement'
    }));

    await Notification.insertMany(notifications);

    // Send emails to users
    const users = await User.find({ _id: { $in: userIds } }).select('email fullName');
    for (const user of users) {
      try {
        await sendOTP(user.email, message, 'notification', title);
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
      }
    }

    res.json({
      success: true,
      message: `Notification sent to ${userIds.length} user(s)`,
      count: userIds.length
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;


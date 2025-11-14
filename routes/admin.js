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

module.exports = router;


import express from 'express';
import User from '../models/User.model.js';
import Window from '../models/Window.model.js';
import Settings from '../models/Settings.model.js';
import Quotation from '../models/Quotation.model.js';
import Invoice from '../models/Invoice.model.js';
import Customer from '../models/Customer.model.js';
import Order from '../models/Order.model.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

// Import models - use ES6 versions
import Subscription from '../models/Subscription.model.js';
import SubscriptionPayment from '../models/PaymentSubscription.model.js';
import ToolSettings from '../models/ToolSettings.model.js';
import RateConfiguration from '../models/RateConfiguration.model.js';
import { sendSettingsChangeNotification } from '../utils/email.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// ============================================
// DASHBOARD & STATISTICS
// ============================================

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    // User Statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ subscriptionStatus: 'active' });
    const trialUsers = await User.countDocuments({ subscriptionStatus: 'trial' });
    const expiredUsers = await User.countDocuments({ subscriptionStatus: 'expired' });
    const cancelledUsers = await User.countDocuments({ subscriptionStatus: 'cancelled' });
    
    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thisMonth } });
    const newUsersThisYear = await User.countDocuments({ createdAt: { $gte: thisYear } });

    // Subscription Statistics
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const expiredSubscriptions = await Subscription.countDocuments({ status: 'expired' });
    const pendingSubscriptions = await Subscription.countDocuments({ status: 'pending' });
    const cancelledSubscriptions = await Subscription.countDocuments({ status: 'cancelled' });

    // Revenue Statistics
    const allPayments = await SubscriptionPayment.find({ status: 'completed' });
    const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const revenueToday = allPayments
      .filter(p => new Date(p.createdAt) >= today)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const revenueThisMonth = allPayments
      .filter(p => new Date(p.createdAt) >= thisMonth)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const revenueThisYear = allPayments
      .filter(p => new Date(p.createdAt) >= thisYear)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Windows & Projects Statistics
    const totalWindows = await Window.countDocuments();
    const windowsThisMonth = await Window.countDocuments({ createdAt: { $gte: thisMonth } });
    const windowsThisYear = await Window.countDocuments({ createdAt: { $gte: thisYear } });

    // Quotations & Invoices
    const totalQuotations = await Quotation.countDocuments();
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const pendingInvoices = await Invoice.countDocuments({ status: { $in: ['sent', 'partial'] } });
    
    const invoiceRevenue = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const invoiceRevenueTotal = invoiceRevenue[0]?.total || 0;

    // User Growth (Last 30 days)
    const userGrowth = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });
      userGrowth.push({ date: date.toISOString().split('T')[0], count });
    }

    // Revenue Trends (Last 30 days)
    const revenueTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const payments = await SubscriptionPayment.find({
        status: 'completed',
        createdAt: { $gte: date, $lt: nextDate }
      });
      const revenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      revenueTrends.push({ date: date.toISOString().split('T')[0], revenue });
    }

    // Most Popular Window Types
    const windowTypes = await Window.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          trial: trialUsers,
          expired: expiredUsers,
          cancelled: cancelledUsers,
          newToday: newUsersToday,
          newThisMonth: newUsersThisMonth,
          newThisYear: newUsersThisYear
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          expired: expiredSubscriptions,
          pending: pendingSubscriptions,
          cancelled: cancelledSubscriptions
        },
        revenue: {
          total: totalRevenue,
          today: revenueToday,
          thisMonth: revenueThisMonth,
          thisYear: revenueThisYear,
          invoiceRevenue: invoiceRevenueTotal
        },
        windows: {
          total: totalWindows,
          thisMonth: windowsThisMonth,
          thisYear: windowsThisYear
        },
        quotations: {
          total: totalQuotations
        },
        invoices: {
          total: totalInvoices,
          paid: paidInvoices,
          pending: pendingInvoices
        },
        trends: {
          userGrowth,
          revenueTrends,
          popularWindowTypes: windowTypes
        }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// ============================================
// USER MANAGEMENT
// ============================================

router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.subscriptionStatus = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    const usersWithStats = await Promise.all(users.map(async (user) => {
      const windowsCount = await Window.countDocuments({ userId: user._id });
      const quotationsCount = await Quotation.countDocuments({ userId: user._id });
      const invoicesCount = await Invoice.countDocuments({ userId: user._id });
      const subscriptionsCount = await Subscription.countDocuments({ userId: user._id });
      
      return {
        ...user.toObject(),
        stats: {
          windows: windowsCount,
          quotations: quotationsCount,
          invoices: invoicesCount,
          subscriptions: subscriptionsCount
        }
      };
    }));

    res.json({
      success: true,
      users: usersWithStats,
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
      message: error.message || 'Server error'
    });
  }
});

// ============================================
// USER SETTINGS & RATES MANAGEMENT
// (Placed before /users/:id to ensure proper route matching)
// ============================================

router.get('/users/:id/settings', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let toolSettings = await ToolSettings.findOne({ userId: user._id });
    if (!toolSettings) {
      // Create default tool settings
      toolSettings = new ToolSettings({ userId: user._id });
      await toolSettings.save();
    }

    res.json({
      success: true,
      settings: toolSettings
    });
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.put('/users/:id/settings', async (req, res) => {
  try {
    const { settings, notifyUser = true } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let toolSettings = await ToolSettings.findOne({ userId: user._id });
    if (!toolSettings) {
      toolSettings = new ToolSettings({ userId: user._id });
    }

    // Update settings
    if (settings.windowCosting) toolSettings.windowCosting = settings.windowCosting;
    if (settings.doorCosting) toolSettings.doorCosting = settings.doorCosting;
    if (settings.cuttingMeasuring) toolSettings.cuttingMeasuring = settings.cuttingMeasuring;
    if (settings.customCategories) toolSettings.customCategories = settings.customCategories;

    await toolSettings.save();

    // Send email notification if requested
    if (notifyUser) {
      const changes = {
        'Tool Settings': 'Your tool settings have been updated by the administrator'
      };
      await sendSettingsChangeNotification(user.email, changes, user.fullName);
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: toolSettings
    });
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.post('/users/:id/settings/reset', async (req, res) => {
  try {
    const { notifyUser = true } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete existing settings
    await ToolSettings.deleteOne({ userId: user._id });

    // Create new default settings
    const toolSettings = new ToolSettings({ userId: user._id });
    await toolSettings.save();

    // Send email notification if requested
    if (notifyUser) {
      const changes = {
        'Tool Settings': 'Your tool settings have been reset to default values'
      };
      await sendSettingsChangeNotification(user.email, changes, user.fullName);
    }

    res.json({
      success: true,
      message: 'Settings reset successfully',
      settings: toolSettings
    });
  } catch (error) {
    console.error('Reset user settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.get('/users/:id/rates', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let rateConfig = await RateConfiguration.findOne({ userId: user._id });
    if (!rateConfig) {
      // Create default rate configuration
      rateConfig = new RateConfiguration({ userId: user._id });
      await rateConfig.save();
    }

    res.json({
      success: true,
      rates: rateConfig
    });
  } catch (error) {
    console.error('Get user rates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.put('/users/:id/rates', async (req, res) => {
  try {
    const { rates, notifyUser = true } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let rateConfig = await RateConfiguration.findOne({ userId: user._id });
    if (!rateConfig) {
      rateConfig = new RateConfiguration({ userId: user._id });
    }

    // Update rates
    Object.assign(rateConfig, rates);
    await rateConfig.save();

    // Send email notification if requested
    if (notifyUser) {
      const changes = {
        'Rate Configuration': 'Your rate configuration has been updated by the administrator'
      };
      await sendSettingsChangeNotification(user.email, changes, user.fullName);
    }

    res.json({
      success: true,
      message: 'Rates updated successfully',
      rates: rateConfig
    });
  } catch (error) {
    console.error('Update user rates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.put('/users/:id/settings-and-rates', async (req, res) => {
  try {
    const { settings, rates, notifyUser = true } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const changes = {};

    // Update tool settings
    if (settings) {
      let toolSettings = await ToolSettings.findOne({ userId: user._id });
      if (!toolSettings) {
        toolSettings = new ToolSettings({ userId: user._id });
      }

      if (settings.windowCosting) toolSettings.windowCosting = settings.windowCosting;
      if (settings.doorCosting) toolSettings.doorCosting = settings.doorCosting;
      if (settings.cuttingMeasuring) toolSettings.cuttingMeasuring = settings.cuttingMeasuring;
      if (settings.customCategories) toolSettings.customCategories = settings.customCategories;

      await toolSettings.save();
      changes['Tool Settings'] = 'Your tool settings have been updated';
    }

    // Update rates
    if (rates) {
      let rateConfig = await RateConfiguration.findOne({ userId: user._id });
      if (!rateConfig) {
        rateConfig = new RateConfiguration({ userId: user._id });
      }

      Object.assign(rateConfig, rates);
      await rateConfig.save();
      changes['Rate Configuration'] = 'Your rate configuration has been updated';
    }

    // Send email notification if requested
    if (notifyUser && Object.keys(changes).length > 0) {
      await sendSettingsChangeNotification(user.email, changes, user.fullName);
    }

    res.json({
      success: true,
      message: 'Settings and rates updated successfully',
      settings: settings ? await ToolSettings.findOne({ userId: user._id }) : null,
      rates: rates ? await RateConfiguration.findOne({ userId: user._id }) : null
    });
  } catch (error) {
    console.error('Update settings and rates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const subscriptions = await Subscription.find({ userId: user._id })
      .sort({ createdAt: -1 });
    
      const payments = await SubscriptionPayment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    const windows = await Window.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    const quotations = await Quotation.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    const invoices = await Invoice.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const windowsCount = await Window.countDocuments({ userId: user._id });
    const quotationsCount = await Quotation.countDocuments({ userId: user._id });
    const invoicesCount = await Invoice.countDocuments({ userId: user._id });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          windows: windowsCount,
          quotations: quotationsCount,
          invoices: invoicesCount
        }
      },
      subscriptions,
      payments,
      recentWindows: windows,
      recentQuotations: quotations,
      recentInvoices: invoices
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { 
      subscriptionTier, 
      subscriptionStatus, 
      subscriptionEndDate,
      subscriptionStartDate,
      isActive,
      fullName,
      companyName,
      phone,
      role
    } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (subscriptionTier !== undefined) user.subscriptionTier = subscriptionTier;
    if (subscriptionStatus !== undefined) user.subscriptionStatus = subscriptionStatus;
    if (subscriptionEndDate) user.subscriptionEndDate = new Date(subscriptionEndDate);
    if (subscriptionStartDate) user.subscriptionStartDate = new Date(subscriptionStartDate);
    if (isActive !== undefined) user.isActive = isActive;
    if (fullName) user.fullName = fullName;
    if (companyName !== undefined) user.companyName = companyName;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;

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
      message: error.message || 'Server error'
    });
  }
});

router.post('/users/:id/extend-trial', async (req, res) => {
  try {
    const { days = 14 } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newEndDate = new Date(user.subscriptionEndDate);
    newEndDate.setDate(newEndDate.getDate() + parseInt(days));
    user.subscriptionEndDate = newEndDate;
    user.subscriptionStatus = 'trial';
    await user.save();

    res.json({
      success: true,
      message: `Trial extended by ${days} days`,
      user
    });
  } catch (error) {
    console.error('Extend trial error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.post('/users/:id/grant-subscription', async (req, res) => {
  try {
    const { tier, months = 1 } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + parseInt(months));

    user.subscriptionTier = tier || '1_month';
    user.subscriptionStatus = 'active';
    user.subscriptionStartDate = startDate;
    user.subscriptionEndDate = endDate;
    await user.save();

    res.json({
      success: true,
      message: `Subscription granted for ${months} month(s)`,
      user
    });
  } catch (error) {
    console.error('Grant subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);

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
      message: error.message || 'Server error'
    });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { email, password, fullName, companyName, phone, subscriptionTier, subscriptionStatus } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      password,
      fullName,
      companyName: companyName || '',
      phone: phone || '',
      subscriptionTier: subscriptionTier || 'trial',
      subscriptionStatus: subscriptionStatus || 'trial',
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days trial
    });

    await user.save();

    res.json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        phone: user.phone,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.email.toLowerCase() === 'abbasvakhariya00@gmail.com') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin account'
      });
    }

    await Window.deleteMany({ userId: user._id });
    await Settings.deleteOne({ userId: user._id });
    await ToolSettings.deleteOne({ userId: user._id });
    await Subscription.deleteMany({ userId: user._id });
    await SubscriptionPayment.deleteMany({ userId: user._id });
    await Quotation.deleteMany({ userId: user._id });
    await Invoice.deleteMany({ userId: user._id });
    await Order.deleteMany({ userId: user._id });
    await Customer.deleteMany({ userId: user._id });
    
    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

router.get('/subscriptions', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '',
      planType = '',
      search = ''
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (status) query.status = status;
    if (planType) query.planType = planType;
    
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }

    const subscriptions = await Subscription.find(query)
      .populate('userId', 'email fullName companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subscription.countDocuments(query);

    res.json({
      success: true,
      subscriptions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.put('/subscriptions/:id', async (req, res) => {
  try {
    const { status, endDate, startDate } = req.body;
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (status) subscription.status = status;
    if (endDate) subscription.endDate = new Date(endDate);
    if (startDate) subscription.startDate = new Date(startDate);
    
    await subscription.save();

    if (status) {
      const user = await User.findById(subscription.userId);
      if (user) {
        user.subscriptionStatus = status === 'active' ? 'active' : 
                                  status === 'expired' ? 'expired' : 
                                  status === 'cancelled' ? 'cancelled' : user.subscriptionStatus;
        if (endDate) user.subscriptionEndDate = new Date(endDate);
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
      message: error.message || 'Server error'
    });
  }
});

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

    const user = await User.findById(subscription.userId);
    if (user) {
      user.subscriptionStatus = 'cancelled';
      await user.save();
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// ============================================
// PAYMENT MANAGEMENT
// ============================================

router.get('/payments', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '',
      dateFrom = '',
      dateTo = '',
      search = ''
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (status) query.status = status;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }

    const payments = await SubscriptionPayment.find(query)
      .populate('userId', 'email fullName companyName')
      .populate('subscriptionId', 'planType price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SubscriptionPayment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.post('/payments/:id/refund', async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const payment = await SubscriptionPayment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed payments'
      });
    }

    payment.status = 'refunded';
    payment.notes = reason || 'Refunded by admin';
    payment.processedBy = req.user._id;
    payment.processedAt = new Date();
    await payment.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      payment
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// ============================================
// WINDOWS MANAGEMENT
// ============================================

router.get('/windows', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category = '',
      dateFrom = '',
      dateTo = '',
      search = ''
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (category) query.category = category;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.userId = { $in: users.map(u => u._id) };
    }

    const windows = await Window.find(query)
      .populate('userId', 'email fullName companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Window.countDocuments(query);

    res.json({
      success: true,
      windows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get windows error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// ============================================
// QUOTATIONS & INVOICES
// ============================================

router.get('/quotations', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const quotations = await Quotation.find(query)
      .populate('userId', 'email fullName companyName')
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Quotation.countDocuments(query);

    res.json({
      success: true,
      quotations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.get('/invoices', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = '',
      dateFrom = '',
      dateTo = ''
    } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const invoices = await Invoice.find(query)
      .populate('userId', 'email fullName companyName')
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// ============================================
// DEVICE MANAGEMENT
// ============================================

router.post('/clear-device/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear both deviceId and currentDevice
    user.deviceId = undefined;
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
      message: error.message || 'Server error'
    });
  }
});

// Clear device by email (for admin convenience)
router.post('/clear-device-by-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Clear both deviceId and currentDevice
    user.deviceId = undefined;
    user.currentDevice = undefined;
    await user.save();

    res.json({
      success: true,
      message: `Device session cleared successfully for ${email}`
    });
  } catch (error) {
    console.error('Clear device by email error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// ============================================
// REPORTS
// ============================================

router.get('/reports/users', async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    let query = {};
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      report: {
        type: 'users',
        dateRange: { from: dateFrom, to: dateTo },
        total: users.length,
        data: users
      }
    });
  } catch (error) {
    console.error('User report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.get('/reports/revenue', async (req, res) => {
  try {
    const { dateFrom, dateTo, groupBy = 'day' } = req.query;
    let query = { status: 'completed' };
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const payments = await SubscriptionPayment.find(query).sort({ createdAt: 1 });
    
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalCount = payments.length;

    res.json({
      success: true,
      report: {
        type: 'revenue',
        dateRange: { from: dateFrom, to: dateTo },
        totalRevenue,
        totalPayments: totalCount,
        data: payments
      }
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// ============================================
// SUBSCRIPTION PLANS MANAGEMENT
// ============================================

router.get('/plans', async (req, res) => {
  try {
    // Get plans from SystemSettings or return default
    const SystemSettingsModule = await import('../models/SystemSettings.js');
    const SystemSettings = SystemSettingsModule.default || SystemSettingsModule;
    const settings = await SystemSettings.findOne({ key: 'subscription_plans' });
    
    const defaultPlans = {
      '1_month': { price: 460, duration: 1, billingCycle: 'monthly', name: '1 Month', enabled: true },
      '3_months': { price: 1250, duration: 3, billingCycle: 'quarterly', name: '3 Months', enabled: true },
      '6_months': { price: 2200, duration: 6, billingCycle: 'semi_annual', name: '6 Months', enabled: true },
      '12_months': { price: 4000, duration: 12, billingCycle: 'annual', name: '12 Months', enabled: true }
    };

    const plans = settings?.value || defaultPlans;

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.post('/plans', async (req, res) => {
  try {
    const { key, name, price, duration, billingCycle, enabled = true } = req.body;

    if (!key || !name || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Key, name, price, and duration are required'
      });
    }

    const SystemSettingsModule = await import('../models/SystemSettings.js');
    const SystemSettings = SystemSettingsModule.default || SystemSettingsModule;
    const settings = await SystemSettings.findOne({ key: 'subscription_plans' });
    
    const defaultPlans = {
      '1_month': { price: 460, duration: 1, billingCycle: 'monthly', name: '1 Month', enabled: true },
      '3_months': { price: 1250, duration: 3, billingCycle: 'quarterly', name: '3 Months', enabled: true },
      '6_months': { price: 2200, duration: 6, billingCycle: 'semi_annual', name: '6 Months', enabled: true },
      '12_months': { price: 4000, duration: 12, billingCycle: 'annual', name: '12 Months', enabled: true }
    };

    const currentPlans = settings?.value || defaultPlans;
    const planKey = key.toLowerCase().replace(/\s+/g, '_');

    currentPlans[planKey] = {
      name,
      price: parseFloat(price),
      duration: parseInt(duration),
      billingCycle: billingCycle || 'monthly',
      enabled: enabled !== false
    };

    await SystemSettings.findOneAndUpdate(
      { key: 'subscription_plans' },
      { 
        key: 'subscription_plans',
        value: currentPlans,
        type: 'object',
        category: 'subscription',
        updatedBy: req.user._id
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Plan created successfully',
      plans: currentPlans
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.put('/plans', async (req, res) => {
  try {
    const { plans } = req.body;
    const SystemSettingsModule = await import('../models/SystemSettings.js');
    const SystemSettings = SystemSettingsModule.default || SystemSettingsModule;
    
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
      message: error.message || 'Server error'
    });
  }
});

router.delete('/plans/:planKey', async (req, res) => {
  try {
    const { planKey } = req.params;
    const SystemSettingsModule = await import('../models/SystemSettings.js');
    const SystemSettings = SystemSettingsModule.default || SystemSettingsModule;
    const settings = await SystemSettings.findOne({ key: 'subscription_plans' });
    
    if (!settings || !settings.value[planKey]) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    delete settings.value[planKey];
    await settings.save();

    res.json({
      success: true,
      message: 'Plan deleted successfully',
      plans: settings.value
    });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

export default router;

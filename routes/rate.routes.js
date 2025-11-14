import express from 'express';
import RateConfiguration from '../models/RateConfiguration.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user's rate configuration
router.get('/', async (req, res) => {
  try {
    let rateConfig = await RateConfiguration.findOne({ userId: req.user._id });

    if (!rateConfig) {
      // Create default configuration
      rateConfig = await RateConfiguration.create({
        userId: req.user._id
      });
    }

    res.json({
      success: true,
      rates: rateConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update rate configuration
router.put('/', async (req, res) => {
  try {
    let rateConfig = await RateConfiguration.findOne({ userId: req.user._id });

    if (!rateConfig) {
      rateConfig = await RateConfiguration.create({
        userId: req.user._id,
        ...req.body
      });
    } else {
      Object.assign(rateConfig, req.body);
      await rateConfig.save();
    }

    res.json({
      success: true,
      message: 'Rate configuration updated successfully',
      rates: rateConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;


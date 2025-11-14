import express from 'express';
import ToolSettings from '../models/ToolSettings.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user's tool settings
router.get('/', async (req, res) => {
  try {
    let toolSettings = await ToolSettings.findOne({ userId: req.user._id });

    if (!toolSettings) {
      // Create default settings
      toolSettings = await ToolSettings.create({
        userId: req.user._id
      });
    }

    res.json({
      success: true,
      settings: toolSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update tool settings
router.put('/', async (req, res) => {
  try {
    let toolSettings = await ToolSettings.findOne({ userId: req.user._id });

    if (!toolSettings) {
      toolSettings = await ToolSettings.create({
        userId: req.user._id,
        ...req.body
      });
    } else {
      Object.assign(toolSettings, req.body);
      await toolSettings.save();
    }

    res.json({
      success: true,
      message: 'Tool settings updated successfully',
      settings: toolSettings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;


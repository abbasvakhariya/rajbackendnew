import express from 'express';
import Window from '../models/Window.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const windows = await Window.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, windows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const window = await Window.findOne({ _id: req.params.id, userId: req.user._id });
    if (!window) {
      return res.status(404).json({ success: false, message: 'Window not found' });
    }
    res.json({ success: true, window });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const window = await Window.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, message: 'Window created successfully', window });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const window = await Window.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!window) {
      return res.status(404).json({ success: false, message: 'Window not found' });
    }
    res.json({ success: true, message: 'Window updated successfully', window });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const window = await Window.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!window) {
      return res.status(404).json({ success: false, message: 'Window not found' });
    }
    res.json({ success: true, message: 'Window deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


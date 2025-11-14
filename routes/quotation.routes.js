import express from 'express';
import Quotation from '../models/Quotation.model.js';
import Customer from '../models/Customer.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const quotations = await Quotation.find({ userId: req.user._id })
      .populate('customerId')
      .sort({ createdAt: -1 });
    res.json({ success: true, quotations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('customerId');
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }
    res.json({ success: true, quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.body.customerId, userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const count = await Quotation.countDocuments({ userId: req.user._id });
    const quotationNumber = `QT${String(count + 1).padStart(4, '0')}`;

    const quotation = await Quotation.create({
      ...req.body,
      userId: req.user._id,
      quotationNumber,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        gst: customer.gst
      }
    });

    res.status(201).json({ success: true, message: 'Quotation created successfully', quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }
    res.json({ success: true, message: 'Quotation updated successfully', quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }
    res.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


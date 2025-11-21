import express from 'express';
import Invoice from '../models/Invoice.model.js';
import Customer from '../models/Customer.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id })
      .populate('customerId')
      .sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('customerId');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, invoice });
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

    const count = await Invoice.countDocuments({ userId: req.user._id });
    const invoiceNumber = `INV${String(count + 1).padStart(4, '0')}`;

    const invoice = await Invoice.create({
      ...req.body,
      userId: req.user._id,
      invoiceNumber,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        gst: customer.gst
      }
    });

    res.status(201).json({ success: true, message: 'Invoice created successfully', invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, message: 'Invoice updated successfully', invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


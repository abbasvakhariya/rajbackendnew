import express from 'express';
import Payment from '../models/Payment.model.js';
import Invoice from '../models/Invoice.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { invoiceId } = req.query;
    let query = { userId: req.user._id };
    if (invoiceId) query.invoiceId = invoiceId;

    const payments = await Payment.find(query)
      .populate('invoiceId')
      .sort({ createdAt: -1 });
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('invoiceId');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.body.invoiceId, userId: req.user._id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const payment = await Payment.create({
      ...req.body,
      userId: req.user._id
    });

    // Update invoice paid amount
    invoice.paid = (invoice.paid || 0) + payment.amount;
    invoice.balance = invoice.total - invoice.paid;
    invoice.status = invoice.balance === 0 ? 'paid' : invoice.balance < invoice.total ? 'partial' : 'draft';
    await invoice.save();

    res.status(201).json({ success: true, message: 'Payment recorded successfully', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, message: 'Payment updated successfully', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    res.json({ success: true, message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


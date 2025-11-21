import express from 'express';
import Order from '../models/Order.model.js';
import Customer from '../models/Customer.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = { userId: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('customerId')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('customerId');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
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

    const count = await Order.countDocuments({ userId: req.user._id });
    const orderNumber = `ORD${String(count + 1).padStart(4, '0')}`;

    const order = await Order.create({
      ...req.body,
      userId: req.user._id,
      orderNumber,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        gst: customer.gst
      }
    });

    res.status(201).json({ success: true, message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


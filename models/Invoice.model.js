import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customer: {
    name: String,
    phone: String,
    email: String,
    address: String,
    gst: String
  },
  items: [{
    description: String,
    quantity: Number,
    unit: String,
    rate: Number,
    amount: Number
  }],
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 18
  },
  total: {
    type: Number,
    default: 0
  },
  paid: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'partial', 'overdue'],
    default: 'draft'
  },
  dueDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries (compound index covers userId queries too)
invoiceSchema.index({ userId: 1, invoiceNumber: 1 });

export default mongoose.model('Invoice', invoiceSchema);


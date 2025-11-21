import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quotationNumber: {
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
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
    default: 'draft'
  },
  validUntil: {
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
quotationSchema.index({ userId: 1, quotationNumber: 1 });

export default mongoose.model('Quotation', quotationSchema);


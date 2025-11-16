import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    default: 'Raj Windows'
  },
  companyAddress: {
    type: String,
    default: ''
  },
  companyPhone: {
    type: String,
    default: ''
  },
  companyEmail: {
    type: String,
    default: ''
  },
  companyGST: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: '₹'
  },
  taxRate: {
    type: Number,
    default: 18
  },
  quotationPrefix: {
    type: String,
    default: 'QT'
  },
  invoicePrefix: {
    type: String,
    default: 'INV'
  },
  termsAndConditions: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// userId already has unique: true, which creates an index automatically
// No need for explicit index

export default mongoose.model('Settings', settingsSchema);


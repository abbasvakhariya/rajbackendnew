import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'manual', 'refund'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: String,
  paypalPaymentId: String,
  paypalPayerId: String,
  invoiceNumber: String,
  notes: String,
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: Date,
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

// Use a different model name to avoid conflict with Payment.model.js (invoice payments)
// Check if model already exists to prevent overwrite errors
const modelName = 'SubscriptionPayment';
const SubscriptionPaymentModel = mongoose.models[modelName] || mongoose.model(modelName, paymentSchema);
export default SubscriptionPaymentModel;


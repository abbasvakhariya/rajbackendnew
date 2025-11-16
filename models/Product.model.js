import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: ''
  },
  thickness: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: 'sq ft'
  },
  price: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries (compound index covers userId queries too)
productSchema.index({ userId: 1, name: 1 });

export default mongoose.model('Product', productSchema);


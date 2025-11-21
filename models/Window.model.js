import mongoose from 'mongoose';

const windowSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: 'Untitled Window'
  },
  type: {
    type: String,
    enum: ['sliding', 'openable'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  hasMosquitoNet: {
    type: Boolean,
    default: false
  },
  hasGrill: {
    type: Boolean,
    default: false
  },
  glassType: {
    type: String,
    default: 'plane'
  },
  calculationData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  costBreakdown: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  totalCost: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries (compound index covers userId queries too)
windowSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Window', windowSchema);


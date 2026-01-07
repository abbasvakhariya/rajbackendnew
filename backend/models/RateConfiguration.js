const mongoose = require('mongoose');

const rateConfigurationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  materialPerKg: {
    type: Number,
    default: 345
  },
  coatingPerKg: {
    type: Number,
    default: 60
  },
  glassPlane: {
    type: Number,
    default: 45
  },
  glassReflective: {
    type: Number,
    default: 75
  },
  lockPerTrack: {
    type: Number,
    default: 100
  },
  bearingPerUnit: {
    type: Number,
    default: 20
  },
  clampPerUnit: {
    type: Number,
    default: 20
  },
  glassRubberPerFeet: {
    type: Number,
    default: 8
  },
  woolfilePerFeet: {
    type: Number,
    default: 2
  },
  labourPerSqft: {
    type: Number,
    default: 50
  },
  fixedCharge: {
    type: Number,
    default: 30
  },
  mosquitoNetPerSqft: {
    type: Number,
    default: 20
  },
  brightBarPerUnit: {
    type: Number,
    default: 2.25
  },
  coverPerUnit: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RateConfiguration', rateConfigurationSchema);








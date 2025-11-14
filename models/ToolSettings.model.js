import mongoose from 'mongoose';

const toolSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  windowCosting: {
    miniDomal: {
      outerFrameKg: { type: Number, default: 0.200 },
      shutterFrameKg: { type: Number, default: 0.175 },
      innerLockClipKg: { type: Number, default: 0.0625 },
      cChannelKg: { type: Number, default: 0.0625 },
      rtKg: { type: Number, default: 0.125 },
      roundPipeKg: { type: Number, default: 0.0625 },
      outerFrameKgWithNet: { type: Number, default: 0.26875 },
      outerFrameKgWithGrill: { type: Number, default: 0.2625 },
      cuttingProfiles: {
        '2_track': { type: String, default: '' },
        '2_track_mosquito': { type: String, default: '' },
        '2_track_grill': { type: String, default: '' },
        '2_track_mosquito_grill': { type: String, default: '' }
      }
    },
    domal: {
      outerFrameKg: { type: Number, default: 0.250 },
      shutterFrameKg: { type: Number, default: 0.200 },
      innerLockClipKg: { type: Number, default: 0.0750 },
      cChannelKg: { type: Number, default: 0.0750 },
      rtKg: { type: Number, default: 0.150 },
      roundPipeKg: { type: Number, default: 0.0750 },
      outerFrameKgWithNet: { type: Number, default: 0.300 },
      outerFrameKgWithGrill: { type: Number, default: 0.290 },
      cuttingProfiles: {
        '2_track': { type: String, default: '' },
        '2_track_mosquito': { type: String, default: '' },
        '2_track_grill': { type: String, default: '' },
        '2_track_mosquito_grill': { type: String, default: '' }
      }
    },
    ventena: {
      outerFrameKg: { type: Number, default: 0.180 },
      shutterFrameKg: { type: Number, default: 0.160 },
      innerLockClipKg: { type: Number, default: 0.0500 },
      cChannelKg: { type: Number, default: 0.0500 },
      rtKg: { type: Number, default: 0.100 },
      roundPipeKg: { type: Number, default: 0.0500 },
      outerFrameKgWithNet: { type: Number, default: 0.240 },
      outerFrameKgWithGrill: { type: Number, default: 0.230 },
      cuttingProfiles: {
        '2_track': { type: String, default: '' },
        '2_track_mosquito': { type: String, default: '' },
        '2_track_grill': { type: String, default: '' },
        '2_track_mosquito_grill': { type: String, default: '' }
      }
    }
  },
  doorCosting: {
    standard: {
      frameKg: { type: Number, default: 0.300 },
      shutterKg: { type: Number, default: 0.250 },
      hingesWeight: { type: Number, default: 0.150 },
      lockWeight: { type: Number, default: 0.200 }
    }
  },
  cuttingMeasuring: {
    profiles: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
  },
  customCategories: {
    sliding: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    openable: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} }
  }
}, {
  timestamps: true
});

// Index for faster queries
toolSettingsSchema.index({ userId: 1 });

export default mongoose.model('ToolSettings', toolSettingsSchema);

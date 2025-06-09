const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String, required: true },
  link: { type: String },
  status: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  deleted_at: { type: Date, default: null },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    role: { type: String, enum: ['admin', 'moderator'], required: true }
  },
}, { timestamps: true });

const Slider = mongoose.model('Slider', sliderSchema);

module.exports = Slider;

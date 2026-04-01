const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Имя обязательно'],
      trim: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned by default in queries
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Composite unique: name is unique within the same group
userSchema.index({ name: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);

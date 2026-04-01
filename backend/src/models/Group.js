const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Название группы обязательно'],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Group', groupSchema);

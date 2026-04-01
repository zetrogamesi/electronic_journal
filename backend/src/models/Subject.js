const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Название предмета обязательно'],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);

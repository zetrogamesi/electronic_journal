const mongoose = require('mongoose');

// A single grade entry inside a student row
const gradeSchema = new mongoose.Schema(
  {
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    value: {
      type: String,
      default: '',
      enum: {
        values: ['', '1', '2', '3', '4', '5', 'н', 'Н', 'зач', 'нез'],
        message: 'Недопустимое значение оценки: {VALUE}',
      },
    },
  },
  { _id: false } // no separate _id for grade sub-docs
);

// A column = one lesson date
const columnSchema = new mongoose.Schema(
  {
    lessonDate: { type: Date, required: true },
    label:      { type: String, default: '' },
    order:      { type: Number, default: 0 },
  }
);

// A student row inside the journal
const studentRowSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order:  { type: Number, default: 0 },
    grades: [gradeSchema],
  }
);

// Main journal document
const journalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Название журнала обязательно'],
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Группа обязательна'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    columns:  [columnSchema],
    students: [studentRowSchema],
  },
  { timestamps: true }
);

// Index for fast group-based lookups
journalSchema.index({ group: 1 });

module.exports = mongoose.model('Journal', journalSchema);

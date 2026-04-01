const Journal = require('../models/Journal');

const ALLOWED = ['', '1', '2', '3', '4', '5', 'н', 'Н', 'зач', 'нез'];

/**
 * PUT /api/journals/grades/upsert (admin)
 * Body: { journal_id, row_id, column_id, value }
 *
 * row_id    = the _id of the students sub-document
 * column_id = the _id of the columns sub-document
 */
const upsertGrade = async (req, res) => {
  try {
    const { journal_id, row_id, column_id, value } = req.body;

    if (!journal_id || !row_id || !column_id)
      return res.status(400).json({ error: 'Недостаточно данных' });

    if (value !== undefined && !ALLOWED.includes(String(value)))
      return res.status(400).json({ error: 'Недопустимое значение оценки' });

    const journal = await Journal.findById(journal_id);
    if (!journal) return res.status(404).json({ error: 'Журнал не найден' });

    // Find the student row
    const studentRow = journal.students.id(row_id);
    if (!studentRow) return res.status(404).json({ error: 'Студент не найден в журнале' });

    // Find existing grade for this column
    const existingGrade = studentRow.grades.find(
      g => String(g.columnId) === String(column_id)
    );

    const trimmedValue = String(value ?? '').trim();

    if (trimmedValue === '') {
      // Delete: remove the grade entry
      studentRow.grades = studentRow.grades.filter(
        g => String(g.columnId) !== String(column_id)
      );
    } else if (existingGrade) {
      // Update existing
      existingGrade.value = trimmedValue;
    } else {
      // Insert new
      studentRow.grades.push({ columnId: column_id, value: trimmedValue });
    }

    await journal.save();
    res.json({ message: 'Оценка сохранена', value: trimmedValue });
  } catch (err) {
    console.error('UpsertGrade error:', err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

module.exports = { upsertGrade };

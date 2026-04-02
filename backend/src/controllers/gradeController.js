const Journal = require('../models/Journal');
const User    = require('../models/User');

const ALLOWED = ['', '1', '2', '3', '4', '5', 'н', 'Н', 'зач', 'нез'];

/**
 * PUT /api/journals/grades/upsert (admin or assigned teacher)
 * Body: { journal_id, row_id, column_id, value }
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

    // Check: must be admin or the assigned teacher of this journal
    const dbUser = await User.findById(req.user.id).select('isAdmin isTeacher').lean();
    const isAssignedTeacher = dbUser?.isTeacher && String(journal.teacher) === String(req.user.id);
    if (!dbUser?.isAdmin && !isAssignedTeacher) {
      return res.status(403).json({ error: 'Нет прав для выставления оценок в этом журнале' });
    }

    // Find the student row
    const studentRow = journal.students.id(row_id);
    if (!studentRow) return res.status(404).json({ error: 'Студент не найден в журнале' });

    // Find existing grade for this column
    const existingGrade = studentRow.grades.find(
      g => String(g.columnId) === String(column_id)
    );

    const trimmedValue = String(value ?? '').trim();

    if (trimmedValue === '') {
      studentRow.grades = studentRow.grades.filter(
        g => String(g.columnId) !== String(column_id)
      );
    } else if (existingGrade) {
      existingGrade.value = trimmedValue;
    } else {
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

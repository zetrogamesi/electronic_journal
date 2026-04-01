const Group   = require('../models/Group');
const Subject = require('../models/Subject');

const DEFAULT_GROUPS = ['ИС-21', 'ИС-22', 'КБ-21', 'КБ-22'];
const DEFAULT_SUBJECTS = ['Математика', 'Физика', 'Информатика', 'Английский язык', 'История'];

/**
 * Insert default reference data if collections are empty.
 * Safe to call on every startup — uses upsert so nothing duplicates.
 */
const seed = async () => {
  try {
    for (const name of DEFAULT_GROUPS) {
      await Group.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
    }
    for (const name of DEFAULT_SUBJECTS) {
      await Subject.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
    }
    console.log('🌱 Начальные данные (группы, предметы) проверены/добавлены');
  } catch (err) {
    console.error('Ошибка сидирования:', err.message);
  }
};

module.exports = seed;

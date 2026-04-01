/**
 * make-admin.js
 * Usage: node make-admin.js "Имя пользователя"
 * Grants admin rights to the specified user (case-insensitive name match).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./src/models/User');

const name = process.argv[2];
if (!name) {
  console.error('Usage: node make-admin.js "Имя пользователя"');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/electronic_journal');
    const user = await User.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${name}$`, 'i') } },
      { isAdmin: true },
      { new: true }
    );
    if (!user) {
      console.error(`❌ Пользователь "${name}" не найден.`);
      process.exit(1);
    }
    console.log(`✅ "${user.name}" теперь администратор.`);
    process.exit(0);
  } catch (err) {
    console.error('Ошибка:', err.message);
    process.exit(1);
  }
})();

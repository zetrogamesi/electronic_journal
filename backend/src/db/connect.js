const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/electronic_journal';

/**
 * Connect to MongoDB using Mongoose.
 * Retries up to 5 times on failure with a 3-second pause.
 */
const connectDB = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI, {
        // These options make Mongoose 7+ behave safely
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅ MongoDB подключена: ${MONGO_URI}`);
      return;
    } catch (err) {
      console.error(`❌ Попытка ${attempt}/${retries} — ошибка подключения к MongoDB: ${err.message}`);
      if (attempt === retries) {
        console.error('Не удалось подключиться к MongoDB. Завершение.');
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB отключилась');
});

module.exports = connectDB;

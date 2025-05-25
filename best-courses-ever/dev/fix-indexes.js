const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Подключились к MongoDB');

    // Получаем коллекцию courses
    const db = mongoose.connection.db;
    const coursesCollection = db.collection('courses');

    // Смотрим, какие индексы существуют
    console.log('\n📋 Текущие индексы:');
    const indexes = await coursesCollection.indexes();
    indexes.forEach((index) => {
      console.log('  -', JSON.stringify(index));
    });

    // Удаляем все индексы кроме _id
    console.log('\n🧹 Удаляем старые индексы...');
    await coursesCollection.dropIndexes();
    console.log('✅ Индексы удалены');

    // Mongoose автоматически создаст правильные индексы при следующем запуске
    console.log(
      '\n💡 Правильные индексы будут созданы автоматически при запуске приложения'
    );
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Отключились от MongoDB');
  }
}

fixIndexes();

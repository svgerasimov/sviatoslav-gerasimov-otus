const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

// Импортируем модели
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Lesson = require('../src/models/Lesson');

// Читаем тестовые данные
const testDataPath = path.join(__dirname, 'test-data.json');

async function seedDatabase() {
  try {
    // Подключаемся к БД
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Подключились к MongoDB');

    // Читаем тестовые данные
    const data = JSON.parse(await fs.readFile(testDataPath, 'utf8'));

    // Очищаем коллекции
    console.log('🧹 Очищаем базу данных...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});

    // Создаем пользователей
    console.log('👥 Создаем пользователей...');
    const users = [];
    for (const userData of data.users) {
      const { password, ...rest } = userData;
      const user = new User(rest);
      // Пароль хешируется автоматически в pre-save hook
      user.password = password;
      await user.save();
      users.push(user);
    }
    console.log(`✅ Создано ${users.length} пользователей`);

    // Создаем курсы
    console.log('📚 Создаем курсы...');
    const courses = [];
    for (const courseData of data.courses) {
      const course = await Course.create(courseData);
      courses.push(course);
    }
    console.log(`✅ Создано ${courses.length} курсов`);

    // Создаем уроки
    console.log('📝 Создаем уроки...');
    const lessons = [];
    for (const lessonData of data.lessons) {
      const lesson = await Lesson.create(lessonData);
      lessons.push(lesson);
    }
    console.log(`✅ Создано ${lessons.length} уроков`);

    console.log(
      '\n🎉 База данных успешно заполнена тестовыми данными!'
    );
    console.log('\n📧 Тестовые аккаунты:');
    console.log('  Админ: admin@example.com / admin123');
    console.log('  Автор: author1@example.com / author123');
    console.log('  Пользователь: user1@example.com / user123');
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Отключились от MongoDB');
  }
}

// Запускаем если скрипт вызван напрямую
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;

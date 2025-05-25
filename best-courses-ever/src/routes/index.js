const express = require('express');
const Course = require('../models/course');
const { loadUser, isAuthenticated } = require('../middlewares/auth');
const router = express.Router();

// Главная страница
router.get('/', loadUser, async (req, res) => {
  try {
    // Получаем популярные курсы для главной
    const popularCourses = await Course.find({ isPublished: true })
      .sort('-stats.rating -stats.views')
      .limit(6)
      .populate('author', 'name avatar');

    res.render('index', {
      title: 'Best Courses Ever - Образовательная платформа',
      popularCourses,
    });
  } catch (error) {
    res.render('index', {
      title: 'Best Courses Ever - Образовательная платформа',
      popularCourses: [],
    });
  }
});

// Страница "О нас"
router.get('/about', loadUser, (req, res) => {
  res.render('about', {
    title: 'О платформе',
  });
});

// Health check для мониторинга
router.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;

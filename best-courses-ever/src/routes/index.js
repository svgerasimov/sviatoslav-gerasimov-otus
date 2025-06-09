const express = require('express');
const Course = require('../models/course');
const router = express.Router();

// Тестовый роут для проверки сессий
router.get('/test-session', (req, res) => {
  // Считаем количество посещений
  if (!req.session.views) {
    req.session.views = 0;
  }
  req.session.views++;

  res.json({
    sessionId: req.sessionID,
    views: req.session.views,
    userId: req.session.userId || 'not logged in',
    sessionData: req.session,
  });
});

// Главная страница

router.get('/', async (req, res) => {
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
router.get('/about', (req, res) => {
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

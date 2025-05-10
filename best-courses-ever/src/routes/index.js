const express = require('express');
const router = express.Router();

const { courseRepo } = require('../repositories');

/**
 * GET /
 * Главная страница (HTML)
 */
router.get('/', (req, res) => {
  // берём последние 3 курса, чтобы вывести карточки на главной
  const latestCourses = courseRepo.getAll().slice(-3).reverse();
  res.render('index', {
    title: 'Главная',
    user: req.user, // если есть сессия
    courses: latestCourses,
  });
});

/**
 * GET /api/health
 * Тестовое «жив?»-API (полезно для мониторинга)
 */
router.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

module.exports = router;

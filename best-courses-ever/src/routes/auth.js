const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest, requireAuth } = require('../middlewares/auth');
const { body } = require('express-validator');

/**
 * Middleware валидации для входа
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Введите пароль'),
];

/**
 * Middleware валидации для регистрации
 */
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть минимум 6 символов')
    .matches(/\d/)
    .withMessage('Пароль должен содержать хотя бы одну цифру'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Пароли не совпадают'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Имя должно быть от 2 до 100 символов'),
];

// ===== СТРАНИЦЫ (HTML) =====

// Страница входа - только для неавторизованных
router.get('/login', requireGuest, authController.loginPage);

// Обработка формы входа
router.post(
  '/login',
  requireGuest,
  loginValidation,
  authController.login
);

// Страница регистрации - только для неавторизованных
router.get('/register', requireGuest, authController.registerPage);

// Обработка формы регистрации
router.post(
  '/register',
  requireGuest,
  registerValidation,
  authController.register
);

// Выход - только для авторизованных
router.get('/logout', requireAuth, authController.logout);
router.post('/logout', requireAuth, authController.logout); // POST для безопасности

// ===== API ENDPOINTS =====

// API: Регистрация
router.post(
  '/api/register',
  registerValidation,
  authController.apiRegister
);

// API: Вход
router.post('/api/login', loginValidation, authController.apiLogin);

// API: Выход
router.post('/api/logout', requireAuth, authController.apiLogout);

// API: Проверка текущей сессии
router.get('/api/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: req.user.toSafeObject(),
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

const { isAuthenticated } = require('../middlewares/auth');
const { registerRules } = require('../middlewares/validation');
const { body } = require('express-validator');

// Страницы авторизации
router.get('/login', authController.loginPage);
router.get('/register', authController.registerPage);

// Обработка форм
router.post('/register', registerRules, authController.register);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  authController.login
);

router.post('/logout', authController.logout);

// API endpoints для авторизации
router.post(
  '/api/auth/register',
  registerRules,
  authController.register
);
router.post(
  '/api/auth/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  authController.login
);
router.post('/api/auth/logout', authController.logout);


router.get(
  '/api/auth/me',
  isAuthenticated,
  authController.getCurrentUser
);

module.exports = router;

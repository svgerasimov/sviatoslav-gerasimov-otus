const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
  isAuthenticated,
  loadUser,
  hasRole,
} = require('../middlewares/auth');
const {
  validateObjectId,
  handleValidationErrors,
} = require('../middlewares/validation');
const { body } = require('express-validator');

// Профиль текущего пользователя
router.get('/profile', isAuthenticated, userController.getProfile);

// Публичный профиль пользователя
router.get(
  '/:id',
  validateObjectId,
  loadUser,
  userController.getUser
);

// Обновление профиля
router.put(
  '/profile',
  isAuthenticated,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Имя должно быть от 2 до 100 символов'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Биография не может быть длиннее 500 символов'),
    handleValidationErrors,
  ],
  userController.updateProfile
);

// Список пользователей (только для админов)
router.get('/', hasRole('admin'), userController.getAllUsers);

// API endpoints
router.get('/api', hasRole('admin'), userController.getAllUsers);

router.get(
  '/:id/api',
  validateObjectId,
  loadUser,
  userController.getUser
);

router.put(
  '/profile/api',
  isAuthenticated,
  userController.updateProfile
);

module.exports = router;

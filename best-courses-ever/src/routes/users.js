const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const {
  validateObjectId,
  handleValidationErrors,
} = require('../middlewares/validation');
const { body } = require('express-validator');

// Профиль текущего пользователя
router.get('/profile', userController.getProfile);

// Публичный профиль пользователя
router.get('/:id', validateObjectId, userController.getUser);

// Обновление профиля
router.put(
  '/profile',
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
router.get('/', userController.getAllUsers);

// API endpoints
router.get('/api', userController.getAllUsers);

router.get('/:id/api', validateObjectId, userController.getUser);

router.put(
  '/profile/api',
  userController.updateProfile
);

module.exports = router;

const {
  body,
  param,
  validationResult,
} = require('express-validator');

// Обработка ошибок валидации
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (req.path.includes('/api')) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Для обычных запросов показываем первую ошибку
    req.flash('error', errors.array()[0].msg);
    return res.redirect('back');
  }

  next();
}

// Правила валидации для регистрации
const registerRules = [
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть минимум 6 символов')
    .matches(/\d/)
    .withMessage('Пароль должен содержать хотя бы одну цифру'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Имя должно быть от 2 до 100 символов'),
  handleValidationErrors,
];

// Правила валидации для курса
const courseRules = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Название должно быть от 3 до 200 символов'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Описание должно быть от 10 до 2000 символов'),
  body('level')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Неверный уровень сложности'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги должны быть массивом'),
  handleValidationErrors,
];

// Правила валидации для урока
const lessonRules = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Название урока должно быть от 3 до 200 символов'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Содержание урока слишком короткое'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Порядок должен быть положительным числом'),
  handleValidationErrors,
];

// Валидация MongoDB ObjectId
const validateObjectId = [
  param('id').isMongoId().withMessage('Неверный ID'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  registerRules,
  courseRules,
  lessonRules,
  validateObjectId,
};

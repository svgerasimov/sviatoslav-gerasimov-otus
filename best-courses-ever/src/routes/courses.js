
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const lessonController = require('../controllers/lessonController');
const {
  isAuthenticated,
  hasRole,
  loadUser,
} = require('../middlewares/auth');
const {
  courseRules,
  lessonRules,
  validateObjectId,
} = require('../middlewares/validation');


// Список курсов (HTML и JSON)
router.get(
  '/',
  courseController.getAllCourses.bind(courseController)
);
router.get(
  '/api',
  courseController.getAllCourses.bind(courseController)
);

// Один курс (HTML и JSON)
router.get(
  '/:id',
  validateObjectId,
  loadUser, // Загружаем пользователя если есть
  courseController.getCourse.bind(courseController)
);
router.get(
  '/:id/api',
  validateObjectId,
  loadUser,
  courseController.getCourse.bind(courseController)
);

// ===== Защищенные маршруты (требуют авторизации) =====
// Создание курса - только для авторов и админов
router.get(
  '/new',
  hasRole('author', 'admin'),
  courseController.newCoursePage.bind(courseController)
);

router.post(
  '/',
  hasRole('author', 'admin'),
  courseRules,
  courseController.createCourse.bind(courseController)
);
router.post(
  '/api',
  hasRole('author', 'admin'),
  courseRules,
  courseController.createCourse.bind(courseController)
);

// Редактирование курса
router.get(
  '/:id/edit',
  validateObjectId,
  isAuthenticated,
  courseController.editCoursePage.bind(courseController)
);

// Для HTML формы используем method-override или POST с _method
router.post(
  '/:id',
  validateObjectId,
  isAuthenticated,
  courseRules,
  courseController.updateCourse.bind(courseController)
);


router.put(
  '/:id/api',
  validateObjectId,
  isAuthenticated,
  courseRules,
  courseController.updateCourse.bind(courseController)
);

// Удаление курса
router.post(
  '/:id/delete',
  validateObjectId,
  isAuthenticated,
  courseController.deleteCourse.bind(courseController)
);
router.delete(
  '/:id/api',
  validateObjectId,
  isAuthenticated,
  courseController.deleteCourse.bind(courseController)
);

// ===== Маршруты для уроков =====
// Список уроков курса (JSON)
router.get(
  '/:courseId/lessons',
  validateObjectId,
  loadUser,
  lessonController.getCourseLessons
);

// Создание урока
router.post(
  '/:courseId/lessons',
  validateObjectId,
  isAuthenticated,
  lessonRules,
  lessonController.createLesson
);

module.exports = router;

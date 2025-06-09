const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const lessonController = require('../controllers/lessonController');
const Course = require('../models/course');
const {
  courseRules,
  lessonRules,
  validateObjectId,
} = require('../middlewares/validation');
const {
  requireAuth,
  requireRole,
  requireOwnerOrAdmin,
  optionalAuth,
} = require('../middlewares/auth');

/**
 * Функция для получения владельца курса
 * Используется в middleware requireOwnerOrAdmin
 */
async function getCourseOwner(req) {
  const course = await Course.findById(req.params.id);
  return course ? course.author : null;
}

// ===== ПУБЛИЧНЫЕ МАРШРУТЫ (доступны всем) =====

// Список курсов - опциональная авторизация для персонализации
router.get(
  '/',
  optionalAuth, // Загружает пользователя, если авторизован
  courseController.getAllCourses.bind(courseController)
);

router.get(
  '/api',
  optionalAuth,
  courseController.getAllCourses.bind(courseController)
);

// Просмотр одного курса - опциональная авторизация
router.get(
  '/:id',
  validateObjectId,
  optionalAuth,
  courseController.getCourse.bind(courseController)
);

router.get(
  '/:id/api',
  validateObjectId,
  optionalAuth,
  courseController.getCourse.bind(courseController)
);

// ===== ЗАЩИЩЕННЫЕ МАРШРУТЫ =====

// Страница создания курса - только для авторов и админов
router.get(
  '/new',
  requireAuth, // Сначала проверяем авторизацию
  requireRole('author', 'admin'), // Затем проверяем роль
  courseController.newCoursePage.bind(courseController)
);

// Создание курса - только для авторов и админов
router.post(
  '/',
  requireAuth,
  requireRole('author', 'admin'),
  courseRules,
  courseController.createCourse.bind(courseController)
);

router.post(
  '/api',
  requireAuth,
  requireRole('author', 'admin'),
  courseRules,
  courseController.createCourse.bind(courseController)
);

// Страница редактирования - только владелец или админ
router.get(
  '/:id/edit',
  validateObjectId,
  requireAuth,
  requireOwnerOrAdmin(getCourseOwner), // Проверяем права на курс
  courseController.editCoursePage.bind(courseController)
);

// Обновление курса - только владелец или админ
router.post(
  '/:id',
  validateObjectId,
  requireAuth,
  requireOwnerOrAdmin(getCourseOwner),
  courseRules,
  courseController.updateCourse.bind(courseController)
);

router.put(
  '/:id/api',
  validateObjectId,
  requireAuth,
  requireOwnerOrAdmin(getCourseOwner),
  courseRules,
  courseController.updateCourse.bind(courseController)
);

// Удаление курса - только владелец или админ
router.post(
  '/:id/delete',
  validateObjectId,
  requireAuth,
  requireOwnerOrAdmin(getCourseOwner),
  courseController.deleteCourse.bind(courseController)
);

router.delete(
  '/:id/api',
  validateObjectId,
  requireAuth,
  requireOwnerOrAdmin(getCourseOwner),
  courseController.deleteCourse.bind(courseController)
);

// Управление доступом к курсу - только владелец
router.post(
  '/:id/grant-access',
  validateObjectId,
  requireAuth,
  requireOwnerOrAdmin(getCourseOwner),
  courseController.grantAccess.bind(courseController)
);

// ===== МАРШРУТЫ ДЛЯ УРОКОВ =====

// Список уроков курса - проверяем доступ к курсу в контроллере
router.get(
  '/:courseId/lessons',
  validateObjectId,
  optionalAuth, // Авторизация опциональна, доступ проверяется в контроллере
  lessonController.getCourseLessons
);

// Создание урока - только автор курса или админ
router.post(
  '/:courseId/lessons',
  validateObjectId,
  requireAuth,
  lessonRules,
  lessonController.createLesson // Дополнительная проверка прав в контроллере
);

module.exports = router;


const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const lessonController = require('../controllers/lessonController');
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
  courseController.getCourse.bind(courseController)
);
router.get(
  '/:id/api',
  validateObjectId,
  courseController.getCourse.bind(courseController)
);

// ===== Защищенные маршруты (требуют авторизации) =====
// Создание курса - только для авторов и админов
router.get(
  '/new',
  courseController.newCoursePage.bind(courseController)
);

router.post(
  '/',
  courseRules,
  courseController.createCourse.bind(courseController)
);
router.post(
  '/api',
  courseRules,
  courseController.createCourse.bind(courseController)
);

// Редактирование курса
router.get(
  '/:id/edit',
  validateObjectId,
  courseController.editCoursePage.bind(courseController)
);

// Для HTML формы используем method-override или POST с _method
router.post(
  '/:id',
  validateObjectId,
  courseRules,
  courseController.updateCourse.bind(courseController)
);


router.put(
  '/:id/api',
  validateObjectId,
  courseRules,
  courseController.updateCourse.bind(courseController)
);

// Удаление курса
router.post(
  '/:id/delete',
  validateObjectId,
  courseController.deleteCourse.bind(courseController)
);
router.delete(
  '/:id/api',
  validateObjectId,
  courseController.deleteCourse.bind(courseController)
);

// ===== Маршруты для уроков =====
// Список уроков курса (JSON)
router.get(
  '/:courseId/lessons',
  validateObjectId,
  lessonController.getCourseLessons
);

// Создание урока
router.post(
  '/:courseId/lessons',
  validateObjectId,
  lessonRules,
  lessonController.createLesson
);

module.exports = router;


const Lesson = require('../models/lesson');
const Course = require('../models/course');

class LessonController {
  // Получить все уроки курса
  async getCourseLessons(req, res, next) {
    try {
      const { courseId } = req.params;

      // Проверяем существование курса
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Курс не найден',
        });
      }

      // Проверяем доступ
      const hasAccess =
        course.isPublic ||
        (req.user &&
          (course.author.toString() === req.user._id.toString() ||
            course.allowedUsers.includes(req.user._id)));

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'У вас нет доступа к урокам этого курса',
        });
      }

      // Получаем уроки
      const lessons = await Lesson.find({ course: courseId })
        .sort('order')
        .select('-completedBy'); // Не показываем кто прошел урок

      res.json({
        success: true,
        data: lessons,
      });
    } catch (error) {
      next(error);
    }
  }

  // Создать новый урок
  async createLesson(req, res, next) {
    try {
      const { courseId } = req.params;
      const {
        title,
        description,
        content,
        order = 0,
        duration,
        isPreview = false,
      } = req.body;

      // Проверяем существование курса
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Курс не найден',
        });
      }

      // Проверяем, является ли пользователь автором курса
      if (
        course.author.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({
          success: false,
          error: 'Только автор курса может добавлять уроки',
        });
      }

      // Создаем урок
      const lesson = new Lesson({
        course: courseId,
        title,
        description,
        content,
        order,
        duration,
        isPreview,
      });

      await lesson.save();

      res.status(201).json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LessonController();

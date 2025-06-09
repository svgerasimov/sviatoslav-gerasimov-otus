const Course = require('../models/course');
const Lesson = require('../models/lesson');
const User = require('../models/user');

class CourseController {
  // Получение списка курсов
  async getAllCourses(req, res, next) {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        level,
        category,
        sort = '-createdAt',
      } = req.query;
      const userId = req.user?._id;

      // Формируем фильтры для MongoDB
      const filters = {};

      // Поиск по названию и описанию
      if (search) {
        filters.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Фильтр по уровню сложности
      if (level) filters.level = level;

      // Фильтр по категории
      if (category) filters.category = category;

      // Показываем только опубликованные курсы
      filters.isPublished = true;

      // Считаем сколько пропустить для пагинации
      const skip = (page - 1) * limit;

      // Выполняем два запроса параллельно: получаем курсы и считаем общее количество
      const [courses, total] = await Promise.all([
        Course.find(filters)
          .populate('author', 'name email avatar') // Подгружаем данные автора
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Course.countDocuments(filters),
      ]);

      // Добавляем информацию о доступе для каждого курса
      const coursesWithAccess = courses.map((course) => {
        const courseObj = course.toObject();

        // Проверяем доступ пользователя к курсу
        if (userId) {
          courseObj.hasAccess =
            course.isPublic ||
            course.author._id.toString() === userId.toString() ||
            course.allowedUsers.some(
              (u) => u.toString() === userId.toString()
            );
          courseObj.isOwner =
            course.author._id.toString() === userId.toString();
        } else {
          courseObj.hasAccess = course.isPublic;
          courseObj.isOwner = false;
        }

        return courseObj;
      });

      // Определяем, нужен JSON или HTML
      if (req.path.includes('/api')) {
        return res.json({
          success: true,
          data: coursesWithAccess,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit),
          },
        });
      }

      // Рендерим HTML страницу
      res.render('courses/index', {
        title: 'Все курсы',
        courses: coursesWithAccess,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
        filters: { search, level, category },
        levels: ['beginner', 'intermediate', 'advanced', 'expert'],
        categories: [
          'programming',
          'design',
          'business',
          'marketing',
          'other',
        ],
      });
    } catch (error) {
      next(error);
    }
  }

  // Получение одного курса с уроками
  async getCourse(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?._id;

      // Находим курс и подгружаем автора
      const course = await Course.findById(id)
        .populate('author', 'name email avatar bio')
        .populate('allowedUsers', 'name email');

      if (!course) {
        const error = new Error('Курс не найден');
        error.status = 404;
        throw error;
      }

      // Увеличиваем счетчик просмотров
      await Course.findByIdAndUpdate(id, {
        $inc: { 'stats.views': 1 },
      });

      // Проверяем доступ к курсу
      const hasAccess =
        course.isPublic ||
        (userId &&
          (course.author._id.toString() === userId.toString() ||
            course.allowedUsers.some(
              (u) => u._id.toString() === userId.toString()
            )));

      // Получаем уроки только если есть доступ
      let lessons = [];
      if (hasAccess) {
        lessons = await Lesson.find({ course: id })
          .sort('order')
          .select('-completedBy'); // Не показываем кто прошел урок
      }

      // Подготавливаем данные курса
      const courseData = course.toObject();
      courseData.hasAccess = hasAccess;
      courseData.isOwner =
        userId && course.author._id.toString() === userId.toString();

      // JSON ответ для API
      if (req.path.includes('/api')) {
        return res.json({
          success: true,
          data: {
            course: courseData,
            lessons,
          },
        });
      }

      // HTML страница курса
      res.render('courses/show', {
        title: course.title,
        course: courseData,
        lessons,
        canEdit: courseData.isOwner || req.user?.role === 'admin',
      });
    } catch (error) {
      next(error);
    }
  }

  // Создание нового курса
  async createCourse(req, res, next) {
    try {
      const userId = req.user._id;
      const {
        title,
        description,
        shortDescription,
        level,
        category,
        tags,
        isPublic,
      } = req.body;

      // Создаем курс
      const course = new Course({
        title,
        description,
        shortDescription,
        level,
        category,
        tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
        author: userId,
        isPublic: isPublic === 'true' || isPublic === true,
        allowedUsers: [userId], // Автор автоматически имеет доступ
        stats: {
          views: 0,
          enrollments: 0,
          rating: 0,
          totalRatings: 0,
        },
      });

      await course.save();

      // Подгружаем данные автора для ответа
      await course.populate('author', 'name email avatar');

      if (req.path.includes('/api')) {
        return res.status(201).json({
          success: true,
          data: course,
        });
      }

      // Редирект на страницу созданного курса
      req.flash('success', 'Курс успешно создан!');
      res.redirect(`/courses/${course._id}`);
    } catch (error) {
      if (req.path.includes('/api')) {
        return next(error);
      }

      req.flash('error', error.message);
      res.redirect('/courses/new');
    }
  }

  // Обновление курса
  async updateCourse(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const updateData = req.body;

      // Находим курс
      const course = await Course.findById(id);

      if (!course) {
        const error = new Error('Курс не найден');
        error.status = 404;
        throw error;
      }

      // Проверяем права на редактирование
      const canEdit =
        course.author.toString() === userId.toString() ||
        req.user.role === 'admin';

      if (!canEdit) {
        const error = new Error(
          'У вас нет прав для редактирования этого курса'
        );
        error.status = 403;
        throw error;
      }

      // Обновляем только разрешенные поля
      const allowedUpdates = [
        'title',
        'description',
        'shortDescription',
        'level',
        'category',
        'tags',
        'isPublic',
      ];
      const updates = {};

      for (const field of allowedUpdates) {
        if (updateData[field] !== undefined) {
          if (field === 'tags') {
            updates.tags = updateData.tags
              .split(',')
              .map((tag) => tag.trim());
          } else if (field === 'isPublic') {
            updates.isPublic =
              updateData.isPublic === 'true' ||
              updateData.isPublic === true;
          } else {
            updates[field] = updateData[field];
          }
        }
      }

      // Применяем обновления
      const updatedCourse = await Course.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).populate('author', 'name email avatar');

      if (req.path.includes('/api')) {
        return res.json({
          success: true,
          data: updatedCourse,
        });
      }

      req.flash('success', 'Курс успешно обновлен!');
      res.redirect(`/courses/${id}`);
    } catch (error) {
      if (req.path.includes('/api')) {
        return next(error);
      }

      req.flash('error', error.message);
      res.redirect(`/courses/${id}/edit`);
    }
  }

  // Удаление курса
  async deleteCourse(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      // Находим курс
      const course = await Course.findById(id);

      if (!course) {
        const error = new Error('Курс не найден');
        error.status = 404;
        throw error;
      }

      // Проверяем права
      const canDelete =
        course.author.toString() === userId.toString() ||
        req.user.role === 'admin';

      if (!canDelete) {
        const error = new Error(
          'У вас нет прав для удаления этого курса'
        );
        error.status = 403;
        throw error;
      }

      // Удаляем курс и все его уроки
      await Promise.all([
        Course.findByIdAndDelete(id),
        Lesson.deleteMany({ course: id }),
      ]);

      if (req.path.includes('/api')) {
        return res.json({
          success: true,
          message: 'Курс успешно удален',
        });
      }

      req.flash('success', 'Курс успешно удален!');
      res.redirect('/courses');
    } catch (error) {
      next(error);
    }
  }

  // Управление доступом к курсу
  async grantAccess(req, res, next) {
    try {
      const { id } = req.params;
      const { userEmail } = req.body;
      const grantorId = req.user._id;

      // Находим курс
      const course = await Course.findById(id);

      if (!course) {
        const error = new Error('Курс не найден');
        error.status = 404;
        throw error;
      }

      // Проверяем, является ли пользователь автором
      if (course.author.toString() !== grantorId.toString()) {
        const error = new Error(
          'Только автор курса может управлять доступом'
        );
        error.status = 403;
        throw error;
      }

      // Находим пользователя по email
      const targetUser = await User.findOne({ email: userEmail });

      if (!targetUser) {
        const error = new Error(
          'Пользователь с таким email не найден'
        );
        error.status = 404;
        throw error;
      }

      // Добавляем пользователя в список разрешенных
      if (!course.allowedUsers.includes(targetUser._id)) {
        course.allowedUsers.push(targetUser._id);
        await course.save();
      }

      if (req.path.includes('/api')) {
        return res.json({
          success: true,
          message: 'Доступ успешно предоставлен',
          data: course,
        });
      }

      req.flash(
        'success',
        `Доступ предоставлен пользователю ${userEmail}`
      );
      res.redirect(`/courses/${id}/settings`);
    } catch (error) {
      next(error);
    }
  }

  // Страницы для форм (только HTML)
  async newCoursePage(req, res) {
    res.render('courses/new', {
      title: 'Создать новый курс',
      levels: ['beginner', 'intermediate', 'advanced', 'expert'],
      categories: [
        'programming',
        'design',
        'business',
        'marketing',
        'other',
      ],
    });
  }

  async editCoursePage(req, res, next) {
    try {
      const { id } = req.params;
      const course = await Course.findById(id);

      if (!course) {
        const error = new Error('Курс не найден');
        error.status = 404;
        throw error;
      }

      // Проверяем права
      const canEdit =
        course.author.toString() === req.user._id.toString() ||
        req.user.role === 'admin';

      if (!canEdit) {
        const error = new Error(
          'У вас нет прав для редактирования этого курса'
        );
        error.status = 403;
        throw error;
      }

      res.render('courses/edit', {
        title: `Редактировать: ${course.title}`,
        course,
        levels: ['beginner', 'intermediate', 'advanced', 'expert'],
        categories: [
          'programming',
          'design',
          'business',
          'marketing',
          'other',
        ],
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseController();

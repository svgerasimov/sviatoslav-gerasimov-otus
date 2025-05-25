class CourseService {
  constructor(courseRepository, lessonRepository, userRepository) {
    this.courseRepo = courseRepository;
    this.lessonRepo = lessonRepository;
    this.userRepo = userRepository;
  }

  // Получение курсов
  async getAllCourses(userId, filters = {}, options = {}) {
    const courses = await this.courseRepo.findAll(filters, options);

    // Добавляем информацию о доступе для каждого курса
    if (userId) {
      courses.data = await Promise.all(
        courses.data.map(async (course) => {
          const hasAccess = await this.courseRepo.hasAccess(
            course._id,
            userId
          );
          return {
            ...course.toObject(),
            hasAccess,
            isOwner: course.author._id.toString() === userId,
          };
        })
      );
    }

    return courses;
  }

  // Создание курса с валидацией
  async createCourse(authorId, courseData) {
    // Проверяем, есть ли у пользователя права автора
    const user = await this.userRepo.findById(authorId);
    if (!user || !['author', 'admin'].includes(user.role)) {
      throw new Error('У вас нет прав для создания курсов');
    }

    // Создаем курс
    const course = await this.courseRepo.create({
      ...courseData,
      author: authorId,
      allowedUsers: [authorId], // Автор автоматически имеет доступ
      stats: {
        views: 0,
        enrollments: 0,
        rating: 0,
        totalRatings: 0,
      },
    });

    return course;
  }

  // Получение курса с проверкой доступа
  async getCourseWithLessons(courseId, userId) {
    const course = await this.courseRepo.findById(courseId);

    if (!course) {
      throw new Error('Курс не найден');
    }

    // Проверяем доступ
    const hasAccess = await this.courseRepo.hasAccess(
      courseId,
      userId
    );

    // Увеличиваем счетчик просмотров
    await this.courseRepo.incrementViews(courseId);

    // Получаем уроки
    let lessons = [];
    if (hasAccess) {
      lessons = await this.lessonRepo.findByCourse(courseId);
    }

    return {
      course: {
        ...course.toObject(),
        hasAccess,
        isOwner: course.author._id.toString() === userId,
      },
      lessons,
    };
  }

  // Обновление курса с проверкой прав
  async updateCourse(courseId, userId, updateData) {
    const course = await this.courseRepo.findById(courseId);

    if (!course) {
      throw new Error('Курс не найден');
    }

    // Проверяем, является ли пользователь автором
    if (course.author.toString() !== userId) {
      const user = await this.userRepo.findById(userId);
      if (user?.role !== 'admin') {
        throw new Error(
          'У вас нет прав для редактирования этого курса'
        );
      }
    }

    // Обновляем курс
    return this.courseRepo.update(courseId, updateData);
  }

  // Управление доступом к курсу
  async grantAccess(courseId, targetUserId, grantorId) {
    const course = await this.courseRepo.findById(courseId);

    if (!course) {
      throw new Error('Курс не найден');
    }

    // Только автор может давать доступ
    if (course.author.toString() !== grantorId) {
      throw new Error('Только автор курса может управлять доступом');
    }

    // Проверяем существование пользователя
    const targetUser = await this.userRepo.findById(targetUserId);
    if (!targetUser) {
      throw new Error('Пользователь не найден');
    }

    return this.courseRepo.addUserAccess(courseId, targetUserId);
  }

  // Оценка курса
  async rateCourse(courseId, userId, rating) {
    if (rating < 1 || rating > 5) {
      throw new Error('Рейтинг должен быть от 1 до 5');
    }

    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new Error('Курс не найден');
    }

    // Проверяем доступ
    const hasAccess = await this.courseRepo.hasAccess(
      courseId,
      userId
    );
    if (!hasAccess) {
      throw new Error('У вас нет доступа к этому курсу');
    }

    // Обновляем рейтинг
    const newTotalRatings = course.stats.totalRatings + 1;
    const newRating =
      (course.stats.rating * course.stats.totalRatings + rating) /
      newTotalRatings;

    return this.courseRepo.update(courseId, {
      'stats.rating': newRating,
      'stats.totalRatings': newTotalRatings,
    });
  }

  // Поиск курсов
  async searchCourses(query, userId) {
    const filters = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    };

    return this.getAllCourses(userId, filters);
  }
}

module.exports = CourseService;

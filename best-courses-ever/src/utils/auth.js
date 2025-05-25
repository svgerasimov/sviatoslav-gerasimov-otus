const crypto = require('crypto');

class AuthUtils {
  // Генерация токена для подтверждения email
  static generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Установка куки с userId
  static setAuthCookie(res, userId) {
    res.cookie('userId', userId, {
      httpOnly: true, // Защита от XSS
      secure: process.env.NODE_ENV === 'production', // HTTPS в production
      sameSite: 'strict', // Защита от CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });
  }

  // Очистка куки при выходе
  static clearAuthCookie(res) {
    res.clearCookie('userId');
  }

  // Проверка прав доступа к ресурсу
  static canEditResource(user, resource) {
    if (!user || !resource) return false;

    // Админ может редактировать всё
    if (user.role === 'admin') return true;

    // Автор может редактировать свои ресурсы
    if (
      resource.author &&
      resource.author.toString() === user._id.toString()
    ) {
      return true;
    }

    return false;
  }

  // Проверка доступа к курсу
  static async checkCourseAccess(course, userId) {
    if (!course) return false;

    // Публичные курсы доступны всем
    if (course.isPublic) return true;

    // Нет userId - нет доступа к приватным курсам
    if (!userId) return false;

    // Автор имеет доступ
    if (
      course.author._id?.toString() === userId ||
      course.author.toString() === userId
    ) {
      return true;
    }

    // Проверяем список разрешенных пользователей
    if (course.allowedUsers) {
      return course.allowedUsers.some(
        (u) => u._id?.toString() === userId || u.toString() === userId
      );
    }

    return false;
  }
}

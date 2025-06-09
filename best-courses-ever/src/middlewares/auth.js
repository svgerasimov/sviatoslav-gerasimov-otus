
/**
 * Проверяет, авторизован ли пользователь
 */
function requireAuth(req, res, next) {
  // Проверяем наличие пользователя (уже загружен предыдущим middleware)
  if (!req.user) {
    // Для API возвращаем JSON с ошибкой
    if (req.path.includes('/api')) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация',
      });
    }

    // Для веб-страниц:
    // 1. Сохраняем flash-сообщение
    req.flash('error', 'Пожалуйста, войдите в систему');

    // 2. Сохраняем URL, куда пользователь хотел попасть
    req.session.returnTo = req.originalUrl;

    // 3. Перенаправляем на страницу входа
    return res.redirect('/login');
  }

  // Пользователь авторизован - пропускаем дальше
  next();
}

/**
 * Проверяет роль пользователя
 * @param {...string} roles - Разрешенные роли
 * Использование: router.post('/courses', requireRole('author', 'admin'), ...)
 */
function requireRole(...roles) {
  return function (req, res, next) {
    // Сначала проверяем авторизацию
    if (!req.user) {
      if (req.path.includes('/api')) {
        return res.status(401).json({
          success: false,
          error: 'Требуется авторизация',
        });
      }
      req.flash('error', 'Пожалуйста, войдите в систему');
      req.session.returnTo = req.originalUrl;
      return res.redirect('/login');
    }

    // Проверяем роль пользователя
    if (!roles.includes(req.user.role)) {
      // У пользователя нет нужной роли
      if (req.path.includes('/api')) {
        return res.status(403).json({
          success: false,
          error: 'У вас нет прав для выполнения этого действия',
        });
      }

      // Для веб - показываем ошибку и возвращаем назад
      req.flash(
        'error',
        'У вас нет прав для доступа к этой странице'
      );
      return res.redirect('back');
    }

    // Роль подходит - пропускаем
    next();
  };
}

/**
 * Проверяет, является ли пользователь автором ресурса или админом
 * Например, для редактирования курса
 *
 * @param {Function} getResourceOwnerId - Функция для получения ID владельца ресурса
 */
function requireOwnerOrAdmin(getResourceOwnerId) {
  return async function (req, res, next) {
    // Проверяем авторизацию
    if (!req.user) {
      if (req.path.includes('/api')) {
        return res.status(401).json({
          success: false,
          error: 'Требуется авторизация',
        });
      }
      req.flash('error', 'Пожалуйста, войдите в систему');
      return res.redirect('/login');
    }

    try {
      // Админы имеют доступ ко всему
      if (req.user.role === 'admin') {
        return next();
      }

      // Получаем ID владельца ресурса
      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        // Ресурс не найден
        const error = new Error('Ресурс не найден');
        error.status = 404;
        return next(error);
      }

      // Проверяем, является ли пользователь владельцем
      if (ownerId.toString() !== req.user._id.toString()) {
        if (req.path.includes('/api')) {
          return res.status(403).json({
            success: false,
            error: 'У вас нет прав для редактирования этого ресурса',
          });
        }

        req.flash(
          'error',
          'Вы можете редактировать только свои курсы'
        );
        return res.redirect('back');
      }

      // Это владелец - пропускаем
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Опциональная авторизация - загружает пользователя, но не требует её
 * Полезно для страниц, которые показывают разный контент для гостей и авторизованных
 */
function optionalAuth(req, res, next) {
  // Пользователь уже загружен автоматическим middleware в app.js
  // Просто идем дальше
  next();
}

/**
 * Проверяет, НЕ авторизован ли пользователь
 * Используется для страниц login/register - авторизованных перенаправляем
 */
function requireGuest(req, res, next) {
  if (req.user) {
    // Пользователь уже авторизован - отправляем на главную
    return res.redirect('/');
  }
  next();
}

module.exports = {
  requireAuth,
  requireRole,
  requireOwnerOrAdmin,
  optionalAuth,
  requireGuest,
};

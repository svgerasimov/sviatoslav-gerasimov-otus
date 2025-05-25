
const User = require('../models/user');

// Проверяем, авторизован ли пользователь
async function isAuthenticated(req, res, next) {
  try {
    // Получаем userId из куки
    const userId = req.cookies.userId;

    if (!userId) {
      // Если это API запрос - возвращаем JSON
      if (req.path.includes('/api')) {
        return res.status(401).json({
          success: false,
          error: 'Требуется авторизация',
        });
      }
      // Для обычных запросов - редирект на логин
      return res.redirect('/login');
    }

    // Находим пользователя в БД
    const user = await User.findById(userId).select('-password');

    if (!user || !user.isActive) {
      res.clearCookie('userId');
      if (req.path.includes('/api')) {
        return res.status(401).json({
          success: false,
          error: 'Пользователь не найден',
        });
      }
      return res.redirect('/login');
    }

    // Сохраняем пользователя в req для использования в контроллерах
    req.user = user;

    // Добавляем пользователя в locals для использования в шаблонах
    res.locals.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (req.path.includes('/api')) {
      return res.status(500).json({
        success: false,
        error: 'Ошибка сервера',
      });
    }
    res.redirect('/login');
  }
}

// Проверяем роль пользователя
function hasRole(...roles) {
  return async (req, res, next) => {
    try {
      // Сначала проверяем авторизацию
      if (!req.user) {
        await isAuthenticated(req, res, () => {});
        if (!req.user) return; // isAuthenticated уже отправил ответ
      }

      // Проверяем роль
      if (!roles.includes(req.user.role)) {
        if (req.path.includes('/api')) {
          return res.status(403).json({
            success: false,
            error: 'Недостаточно прав доступа',
          });
        }
        return res.status(403).render('error', {
          title: 'Доступ запрещен',
          message:
            'У вас недостаточно прав для просмотра этой страницы',
          error: {},
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        error: 'Ошибка сервера',
      });
    }
  };
}

// Опциональная авторизация - не блокирует, но загружает пользователя если есть
async function loadUser(req, res, next) {
  try {
    const userId = req.cookies.userId;

    if (userId) {
      const user = await User.findById(userId).select('-password');
      if (user && user.isActive) {
        req.user = user;
        res.locals.user = user;
      } else {
        res.clearCookie('userId');
      }
    }

    // В любом случае продолжаем
    next();
  } catch (error) {
    console.error('Load user error:', error);
    // Не блокируем запрос при ошибке
    next();
  }
}

module.exports = {
  isAuthenticated,
  hasRole,
  loadUser,
};

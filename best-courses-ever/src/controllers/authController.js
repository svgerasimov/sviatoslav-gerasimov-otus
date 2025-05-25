const User = require('../models/user');
const { validationResult } = require('express-validator');

class AuthController {
  // Страница входа
  async loginPage(req, res) {
    // Если пользователь уже авторизован - редирект на главную
    if (req.user) {
      return res.redirect('/');
    }

    res.render('auth/login', {
      title: 'Вход в систему',
    });
  }

  // Страница регистрации
  async registerPage(req, res) {
    if (req.user) {
      return res.redirect('/');
    }

    res.render('auth/register', {
      title: 'Регистрация',
    });
  }

  // Обработка регистрации
  async register(req, res, next) {
    try {
      // Проверяем валидацию
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Для API возвращаем JSON
        if (req.path.includes('/api')) {
          return res.status(400).json({
            success: false,
            errors: errors.array(),
          });
        }

        // Для веб-формы показываем ошибки
        req.flash('error', errors.array()[0].msg);
        return res.redirect('/register');
      }

      const {
        email,
        password,
        name,
        role = 'user',
        confirmPassword,
      } = req.body;

      // Проверяем совпадение паролей
      if (password !== confirmPassword) {
        if (req.path.includes('/api')) {
          return res.status(400).json({
            success: false,
            error: 'Пароли не совпадают',
          });
        }

        req.flash('error', 'Пароли не совпадают');
        return res.redirect('/register');
      }

      // Проверяем, не занят ли email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (req.path.includes('/api')) {
          return res.status(400).json({
            success: false,
            error: 'Пользователь с таким email уже существует',
          });
        }

        req.flash(
          'error',
          'Пользователь с таким email уже существует'
        );
        return res.redirect('/register');
      }

      // Создаем пользователя
      const user = new User({
        email,
        password, // Хешируется автоматически в pre-save hook
        name,
        role: ['user', 'author'].includes(role) ? role : 'user',
      });

      await user.save();

      // Автоматически логиним после регистрации
      res.cookie('userId', user._id.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      });

      // Обновляем lastLogin
      user.lastLogin = new Date();
      await user.save();

      if (req.path.includes('/api')) {
        return res.status(201).json({
          success: true,
          data: {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          },
        });
      }

      req.flash('success', 'Добро пожаловать на платформу!');
      res.redirect('/courses');
    } catch (error) {
      next(error);
    }
  }

  // Обработка входа
  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.path.includes('/api')) {
          return res.status(400).json({
            success: false,
            errors: errors.array(),
          });
        }

        req.flash('error', 'Проверьте правильность введенных данных');
        return res.redirect('/login');
      }

      const { email, password, rememberMe } = req.body;

      // Находим пользователя (включаем поле password для проверки)
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        if (req.path.includes('/api')) {
          return res.status(401).json({
            success: false,
            error: 'Неверный email или пароль',
          });
        }

        req.flash('error', 'Неверный email или пароль');
        return res.redirect('/login');
      }

      // Проверяем пароль
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        if (req.path.includes('/api')) {
          return res.status(401).json({
            success: false,
            error: 'Неверный email или пароль',
          });
        }

        req.flash('error', 'Неверный email или пароль');
        return res.redirect('/login');
      }

      // Проверяем, активен ли аккаунт
      if (!user.isActive) {
        if (req.path.includes('/api')) {
          return res.status(403).json({
            success: false,
            error: 'Ваш аккаунт заблокирован',
          });
        }

        req.flash('error', 'Ваш аккаунт заблокирован');
        return res.redirect('/login');
      }

      // Устанавливаем куку
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      };

      if (rememberMe) {
        cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 дней
      } else {
        cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 дней
      }

      res.cookie('userId', user._id.toString(), cookieOptions);

      // Обновляем lastLogin
      user.lastLogin = new Date();
      await user.save();

      if (req.path.includes('/api')) {
        return res.json({
          success: true,
          data: {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          },
        });
      }

      req.flash('success', `С возвращением, ${user.name}!`);
      res.redirect('/courses');
    } catch (error) {
      next(error);
    }
  }

  // Выход из системы
  async logout(req, res) {
    // Очищаем куку
    res.clearCookie('userId');

    // Очищаем сессию если используется
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
      });
    }

    if (req.path.includes('/api')) {
      return res.json({
        success: true,
        message: 'Вы успешно вышли из системы',
      });
    }

    res.redirect('/');
  }

  // Получение текущего пользователя (для API)
  async getCurrentUser(req, res) {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          bio: req.user.bio,
          avatar: req.user.avatar,
        },
      },
    });
  }
}
module.exports = new AuthController();

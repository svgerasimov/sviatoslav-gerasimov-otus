const User = require('../models/user');
const { validationResult } = require('express-validator');

/**
 * Показывает страницу входа
 */
exports.loginPage = (req, res) => {
  res.render('auth/login', {
    title: 'Вход',
    // Если есть сохраненный URL, передаем его в форму
    returnTo: req.session.returnTo,
  });
};

/**
 * Показывает страницу регистрации
 */
exports.registerPage = (req, res) => {
  res.render('auth/register', {
    title: 'Регистрация',
  });
};

/**
 * Обрабатывает регистрацию нового пользователя
 */
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/register');
  }

  const { email, password, name, role = 'user' } = req.body;

  try {
    // Проверяем, не занят ли email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Пользователь с таким email уже существует');
      return res.redirect('/register');
    }

    // Создаем нового пользователя
    // Пароль автоматически хешируется в модели (pre-save hook)
    const newUser = new User({
      email,
      password, // Будет захеширован автоматически
      name,
      role: ['user', 'author'].includes(role) ? role : 'user', // Защита от создания админов
    });

    await newUser.save();

    // Сразу авторизовать после регистрации
    req.session.userId = newUser._id;

    req.flash('success', `Добро пожаловать, ${newUser.name}!`);

    // Перенаправить на сохранённый URL или на главную
    const redirectTo = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectTo);
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    req.flash(
      'error',
      'Произошла ошибка при регистрации. Попробуйте позже.'
    );
    res.redirect('/register');
  }
};

/**
 * Обрабатывает вход пользователя
 */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/login');
  }

  const { email, password, rememberMe } = req.body;

  try {
    // Ищем пользователя по email (включая пароль для проверки)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      req.flash('error', 'Неверный email или пароль');
      return res.redirect('/login');
    }

    // Проверяем пароль
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      req.flash('error', 'Неверный email или пароль');
      return res.redirect('/login');
    }

    // Проверяем, активен ли пользователь
    if (!user.isActive) {
      req.flash(
        'error',
        'Ваш аккаунт заблокирован. Обратитесь к администратору.'
      );
      return res.redirect('/login');
    }

    // === СОЗДАЕМ СЕССИЮ ===
    // Сохраняем ID пользователя в сессии
    req.session.userId = user._id;

    // Если пользователь хочет, чтобы его запомнили
    if (rememberMe) {
      // Увеличиваем время жизни сессии до 30 дней
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    }

    // Обновляем время последнего входа
    user.lastLogin = new Date();
    await user.save();

    // Определяем, куда перенаправить пользователя
    const redirectTo = req.session.returnTo || '/';
    delete req.session.returnTo; // Очищаем сохраненный URL

    req.flash('success', `Добро пожаловать, ${user.name}!`);
    res.redirect(redirectTo);
  } catch (error) {
    console.error('Ошибка входа:', error);
    req.flash(
      'error',
      'Произошла ошибка при входе. Попробуйте позже.'
    );
    res.redirect('/login');
  }
};

/**
 * Выход пользователя
 */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Ошибка при выходе:', err);
      req.flash('error', 'Произошла ошибка при выходе');
      return res.redirect('/');
    }

    // Очищаем cookie сессии
    res.clearCookie('bce.sid');

    // Перенаправляем на главную
    res.redirect('/');
  });
};

/**
 * API: Регистрация
 */
exports.apiRegister = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email уже используется',
      });
    }

    const user = new User({ email, password, name });
    await user.save();

    // Создаем сессию для API
    req.session.userId = user._id;

    res.status(201).json({
      success: true,
      data: {
        user: user.toSafeObject(),
        sessionId: req.sessionID,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * API: Вход
 */
exports.apiLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Неверные учетные данные',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Аккаунт заблокирован',
      });
    }

    // Создаем сессию
    req.session.userId = user._id;

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      data: {
        user: user.toSafeObject(),
        sessionId: req.sessionID,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * API: Выход
 */
exports.apiLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Ошибка при выходе',
      });
    }

    res.json({
      success: true,
      message: 'Вы успешно вышли',
    });
  });
};

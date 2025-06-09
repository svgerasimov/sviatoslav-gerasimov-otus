const express = require('express');
const session = require('express-session');
const path = require('node:path');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/db');

// Роутеры верхнего уровня
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const coursesRouter = require('./routes/courses');

const app = express();

// Подключаемся к MongoDB
connectDB();

// ===== НАСТРОЙКА VIEW ENGINE С LAYOUTS =====
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Настраиваем express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// ===== MIDDLEWARE =====
app.use(morgan('dev'));
// 1. парсим куки
app.use(cookieParser());
// 2. Настраиваем сессии
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Только для HTTPS в продакшене
      sameSite: 'strict', // Защита от CSRF
    },
    name: 'bce.sid', // Имя куки сессии
  })
);
// 3. Парсим тело запроса
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 4. CORS
app.use(cors({ origin: true, credentials: true }));

app.use(express.static(path.join(__dirname, '..', 'public')));

// ===== FLASH СООБЩЕНИЯ через сессии =====
app.use((req, res, next) => {
  req.flash = (type, message) => {
    req.session.flash = req.session.flash || {};
    req.session.flash[type] = req.session.flash[type] || [];
    req.session.flash[type].push(message);
  };

  const messages =
    req.session && req.session.flash ? req.session.flash : {};
  res.locals.messages = messages;

  if (
    req.session &&
    req.session.flash &&
    Object.keys(req.session.flash).length > 0
  ) {
    req.session.flash = {};
  }

  next();
});

// Для отладки сессий в dev режиме
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    if (req.session) {
      console.log('Session exists:', req.sessionID);
      console.log('Session data:', req.session);
    } else {
      console.log('No session');
    }
    next();
  });
}

// ===== АВТОМАТИЧЕСКАЯ ЗАГРУЗКА ПОЛЬЗОВАТЕЛЯ =====
app.use(async (req, res, next) => {
  // Сначала проверяем, есть ли userId в сессии
  if (!req.session || !req.session.userId) {
    // Нет сессии или userId - пользователь не авторизован
    res.locals.user = null;
    return next();
  }

  try {
    // Пробуем загрузить пользователя из базы
    const User = require('./models/user');
    const user = await User.findById(req.session.userId).select(
      '-password'
    );

    if (user && user.isActive) {
      // Пользователь найден и активен
      req.user = user;
      res.locals.user = user;
    } else {
      // Пользователь не найден или заблокирован
      delete req.session.userId;
      req.user = null;
      res.locals.user = null;
    }
  } catch (error) {
    console.error('Error loading user:', error);
    // При ошибке очищаем сессию для безопасности
    delete req.session.userId;
    req.user = null;
    res.locals.user = null;
  }

  next();
});

// ===== МАРШРУТЫ =====
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/users', usersRouter);
app.use('/courses', coursesRouter);

// ===== ОБРАБОТКА ОШИБОК =====
app.use((req, res, next) => {
  const error = new Error('Страница не найдена');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status);

  console.error('Error:', {
    message: err.message,
    status: err.status,
    stack: err.stack,
  });

  const wantsJSON =
    req.path.startsWith('/api') ||
    req.path.includes('/api') ||
    (req.accepts('json') && !req.accepts('html'));

  if (wantsJSON) {
    return res.json({
      success: false,
      error: {
        message: err.message,
        status: status,
        ...(app.get('env') === 'development' && { stack: err.stack }),
      },
    });
  }

  res.render('error', {
    title: 'Ошибка',
    message: err.message,
    status: status,
    error: app.get('env') === 'development' ? err : {},
    layout: 'layout',
  });
});

module.exports = app;

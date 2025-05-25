const express = require('express');
const path = require('node:path');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const connectDB = require('./config/db');

// Импортируем роутеры
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
app.set('layout', 'layout'); // Указываем имя файла layout (по умолчанию layout.ejs)
app.set('layout extractScripts', true); // Извлекаем скрипты из страниц
app.set('layout extractStyles', true); // Извлекаем стили из страниц

// ===== MIDDLEWARE =====
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Flash сообщения через куки
app.use((req, res, next) => {
  if (!req.flash) {
    req.flash = (type, message) => {
      res.cookie(`flash_${type}`, message, {
        httpOnly: true,
        maxAge: 1000 * 60,
      });
    };
  }

  res.locals.messages = {
    success: req.cookies.flash_success,
    error: req.cookies.flash_error,
  };

  if (req.cookies.flash_success) res.clearCookie('flash_success');
  if (req.cookies.flash_error) res.clearCookie('flash_error');

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

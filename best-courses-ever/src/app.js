// Главный файл конфигурации Express-приложения в стиле MVC + Tailwind static

const express = require('express');
const path = require('node:path');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');

// Роутеры верхнего уровня
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const coursesRouter = require('./routes/courses');

const app = express();

// ───────────────── View engine (EJS) ─────────────────
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ───────────────── Middlewares ─────────────────
app.use(morgan('dev')); // цветные HTTP-логи
app.use(express.json()); // JSON-body → req.body
app.use(express.urlencoded({ extended: false })); // form-urlencoded
app.use(cors({ origin: true, credentials: true })); // CORS для фронта
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public'))); // /public -> /stylesheets/style.css и пр.

// ───────────────── Маршруты ─────────────────
app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/users', usersRouter);
app.use('/courses', coursesRouter); // вкл. вложенные /:courseId/lessons

// ───────────────── 404 + Error handler ─────────────────
app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  // если клиент ждёт JSON — отправляем JSON
  if (
    req.path.startsWith('/api') ||
    (req.accepts('json') && !req.accepts('html'))
  ) {
    return res.json({
      message: err.message,
      stack:
        req.app.get('env') === 'development' ? err.stack : undefined,
    });
  }

  // HTML-страница
  res.render('error', {
    title: 'Ошибка',
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {},
    user: req.user ?? null,
  });
});

module.exports = app;

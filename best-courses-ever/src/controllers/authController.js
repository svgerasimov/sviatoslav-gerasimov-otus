// напиши простой контроллер для авторизации не на классах, а в функциональном стиле
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const { JWT_SECRET } = process.env;

exports.loginPage = (req, res) => {
  res.render('auth/login', {
    title: 'Вход',
    messages: req.flash('error'),
  });
}
exports.registerPage = (req, res) => {
  res.render('auth/register', {
    title: 'Регистрация',
    messages: req.flash('error'),
  });
}
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(err => err.msg));
    return res.redirect('/register');
  }

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'Пользователь с таким email уже существует');
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    req.flash('success', 'Вы успешно зарегистрированы! Пожалуйста, войдите в систему.');
    res.redirect('/login');
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    req.flash('error', 'Произошла ошибка при регистрации. Попробуйте позже.');
    res.redirect('/register');
  }
}
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(err => err.msg));
    return res.redirect('/login');
  }

  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  try {
    const user = await User.findOne({ email });
    console.log('Found user:', user);
    if (!user) {
      req.flash('error', 'Неверный email или пароль');
      return res.redirect('/login');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash('error', 'Неверный email или пароль');
      return res.redirect('/login');
    }

    // Генерация JWT токена
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

    // Сохраняем токен в сессии
    req.session.token = token;
    req.session.userId = user._id;

    req.flash('success', 'Вы успешно вошли в систему!');
    res.redirect('/');
  } catch (error) {
    console.error('Ошибка входа:', error);
    req.flash('error', 'Произошла ошибка при входе. Попробуйте позже.');
    res.redirect('/login');
  }
}


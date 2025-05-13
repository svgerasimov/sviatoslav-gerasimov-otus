const User = require('../models/user');

// формы
exports.loginPage = (_, res) =>
  res.render('auth/login', { title: 'Вход' });
exports.registerPage = (_, res) =>
  res.render('auth/register', { title: 'Регистрация' });

// JSON-API
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Missing fields' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ id: user._id, email: user.email });
  } catch (err) {
    next(err);
  }
};

exports.login = (req, res, next) => {
  res.status(501).json({ message: 'Not implemented' });
};
exports.logout = (req, res, next) => {
  res.status(501).json({ message: 'Not implemented' });
};

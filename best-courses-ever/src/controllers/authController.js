const { userRepo } = require('../repositories');

// формы
exports.loginPage = (_, res) =>
  res.render('auth/login', { title: 'Вход' });
exports.registerPage = (_, res) =>
  res.render('auth/register', { title: 'Регистрация' });

// JSON-API
exports.register = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Missing fields' });
  const user = userRepo.create({ name, email });

  res.status(201).json({ id: user.id, email: user.email });
};

exports.login = (req, res) => {
  // Здесь просто 501 (заглушка)
  res.status(501).json({ message: 'Not implemented' });
};

exports.logout = (_, res) =>
  res.status(501).json({ message: 'Not implemented' });

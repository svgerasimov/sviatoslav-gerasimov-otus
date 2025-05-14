const { userRepo } = require('../repositories');

// Возвращаем JSON → логично назвать listJSON / showJSON
exports.listJSON = (_, res) => {
  res.json(userRepo.getAll());
};

exports.showJSON = (req, res) => {
  const user = userRepo.getById(Number(req.params.id));
  user
    ? res.json(user)
    : res.status(404).json({ message: 'User not found' });
};

// CRUD, если понадобятся позже:
exports.createJSON = (req, res) => {
  const user = userRepo.create(req.body);
  res.status(201).json(user);
};
exports.updateJSON = (req, res) => {
  const user = userRepo.update(Number(req.params.id), req.body);
  user
    ? res.json(user)
    : res.status(404).json({ message: 'User not found' });
};
exports.deleteJSON = (req, res) => {
  const ok = userRepo.remove(Number(req.params.id));
  ok
    ? res.status(204).end()
    : res.status(404).json({ message: 'User not found' });
};

const User = require('../models/user');

// Возвращаем JSON → логично назвать listJSON / showJSON
exports.listJSON = async (_req, res, next) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.showJSON = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    user
      ? res.json(user)
      : res.status(404).json({ message: 'User not found' });
  } catch (err) {
    next(err);
  }
};

// CRUD, если понадобятся позже:
exports.createJSON = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};
exports.updateJSON = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    user
      ? res.json(user)
      : res.status(404).json({ message: 'User not found' });
  } catch (err) {
    next(err);
  }
};
exports.deleteJSON = async (req, res, next) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    result
      ? res.status(204).end()
      : res.status(404).json({ message: 'User not found' });
  } catch (err) {
    next(err);
  }
};

const { courseRepo } = require('../repositories');

// ---------- HTML ----------
exports.listPage = (req, res) => {
  res.render('courses/list', {
    title: 'Курсы',
    courses: courseRepo.getAll(),
  });
};
exports.showPage = (req, res) => {
  const course = courseRepo.getById(Number(req.params.id));
  if (!course)
    return res
      .status(404)
      .render('error', { message: 'Курс не найден' });
  res.render('courses/show', { title: course.title, course });
};

// ---------- JSON ----------
exports.listJSON = (req, res) => res.json(courseRepo.getAll());
exports.showJSON = (req, res) => {
  const course = courseRepo.getById(Number(req.params.id));
  course
    ? res.json(course)
    : res.status(404).json({ message: 'Курс не найден' });
};
exports.createJSON = (req, res) => {
  const course = courseRepo.create(req.body);
  res.status(201).json(course);
};
exports.updateJSON = (req, res) => {
  const course = courseRepo.update(Number(req.params.id), req.body);
  course
    ? res.json(course)
    : res.status(404).json({ message: 'Курс не найден' });
};
exports.deleteJSON = (req, res) => {
  const ok = courseRepo.remove(Number(req.params.id));
  ok
    ? res.status(204).end()
    : res.status(404).json({ message: 'Курс не найден' });
};

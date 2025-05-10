const { lessonRepo } = require('../repositories');

exports.listJSON = (req, res) => {
  const lessons = lessonRepo.getByCourseId(
    Number(req.params.courseId)
  );
  res.json(lessons);
};

exports.showJSON = (req, res) => {
  const lesson = lessonRepo.getById(Number(req.params.lessonId));
  lesson
    ? res.json(lesson)
    : res.status(404).json({ message: 'Lesson not found' });
};

exports.createJSON = (req, res) => {
  const lesson = lessonRepo.create(
    Number(req.params.courseId),
    req.body
  );
  res.status(201).json(lesson);
};

exports.updateJSON = (req, res) => {
  const lesson = lessonRepo.update(
    Number(req.params.lessonId),
    req.body
  );
  lesson
    ? res.json(lesson)
    : res.status(404).json({ message: 'Lesson not found' });
};

exports.deleteJSON = (req, res) => {
  const lesson = lessonRepo.deleteById(Number(req.params.lessonId));
  lesson
    ? res.status(204).end()
    : res.status(404).json({ message: 'Lesson not found' });
};

exports.deleteAllJSON = (req, res) => {
  lessonRepo.deleteAll();
  res.status(204).end();
};

exports.deleteByCourseIdJSON = (req, res) => {
  lessonRepo.deleteByCourseId(Number(req.params.courseId));
  res.status(204).end();
};

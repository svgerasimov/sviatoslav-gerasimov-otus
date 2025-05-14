const Lesson = require('../models/lesson');

exports.listJSON = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({
      courseId: req.params.courseId,
    }).lean();
    res.json(lessons);
  } catch (err) {
    next(err);
  }
};

exports.showJSON = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId).lean();
    lesson
      ? res.json(lesson)
      : res.status(404).json({ message: 'Lesson not found' });
  } catch (err) {
    next(err);
  }
};

exports.createJSON = async (req, res, next) => {
  try {
    const lesson = await Lesson.create({
      ...req.body,
      courseId: req.params.courseId,
    });
    res.status(201).json(lesson);
  } catch (err) {
    next(err);
  }
};

exports.updateJSON = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    lesson
      ? res.json(lesson)
      : res.status(404).json({ message: 'Lesson not found' });
  } catch (err) {
    next(err);
  }
};

exports.deleteJSON = async (req, res, next) => {
  try {
    const result = await Lesson.findByIdAndDelete(
      req.params.lessonId
    );
    result
      ? res.status(204).end()
      : res.status(404).json({ message: 'Lesson not found' });
  } catch (err) {
    next(err);
  }
};

exports.deleteAllJSON = async (_req, res, next) => {
  try {
    await Lesson.deleteMany();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.deleteByCourseIdJSON = async (req, res, next) => {
  try {
    await Lesson.deleteMany({ courseId: req.params.courseId });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

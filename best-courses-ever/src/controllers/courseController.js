const Course = require('../models/course');
const Lesson = require('../models/lesson');
const User = require('../models/user');

// ---------- HTML ----------
exports.listPage = async (req, res, next) => {
  try {
    const courses = await Course.find().lean();
    res.render('courses/list', { title: 'Курсы', courses });
  } catch (err) {
    next(err);
  }
};

exports.showPage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    if (!course) {
      return res
        .status(404)
        .render('error', { message: 'Курс не найден' });
    }
    const author = await User.findById(course.authorId).lean();
    const lessons = await Lesson.find({ courseId: id }).lean();
    res.render('courses/show', {
      title: course.title,
      course: { ...course, authorName: author?.name },
      lessons,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- JSON ----------
exports.listJSON = async (req, res, next) => {
  try {
    const courses = await Course.find().lean();
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

exports.showJSON = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    course
      ? res.json(course)
      : res.status(404).json({ message: 'Курс не найден' });
  } catch (err) {
    next(err);
  }
};

exports.createJSON = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

exports.updateJSON = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    course
      ? res.json(course)
      : res.status(404).json({ message: 'Курс не найден' });
  } catch (err) {
    next(err);
  }
};

exports.deleteJSON = async (req, res, next) => {
  try {
    const result = await Course.findByIdAndDelete(req.params.id);
    result
      ? res.status(204).end()
      : res.status(404).json({ message: 'Курс не найден' });
  } catch (err) {
    next(err);
  }
};

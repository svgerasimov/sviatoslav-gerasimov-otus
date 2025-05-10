const { Course } = require('../models');

class CourseRepository {
  #courses = [];
  #nextId = 1;

  getAll() {
    return this.#courses;
  }

  getById(id) {
    return this.#courses.find((c) => c.id === id) ?? null;
  }

  create(dto) {
    const course = new Course({ id: this.#nextId++, ...dto });
    this.#courses.push(course);
    return course;
  }

  update(id, dto) {
    const course = this.getById(id);
    if (!course) return null;
    Object.assign(course, dto);
    return course;
  }

  remove(id) {
    const idx = this.#courses.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.#courses.splice(idx, 1);
    return true;
  }

  addLesson(courseId, lessonId) {
    const course = this.getById(courseId);
    if (!course) return null;
    course.lessonIds.push(lessonId);
    return course;
  }

  setRating(id, newRating) {
    const course = this.getById(id);
    if (!course) return null;
    course.rating = newRating;
    return course;
  }

  _clear() {
    this.#courses = [];
    this.#nextId = 1;
  }
}

module.exports = new CourseRepository();

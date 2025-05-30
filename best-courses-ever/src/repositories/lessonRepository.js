const { Lesson } = require('../models');

class LessonRepository {
  #lessons = [];
  #nextId = 1;

  getByCourseId(courseId) {
    return this.#lessons.filter((l) => l.courseId === courseId);
  }

  getById(id) {
    return this.#lessons.find((l) => l.id === id) ?? null;
  }

  create(courseId, dto) {
    const lesson = new Lesson({
      id: this.#nextId++,
      courseId,
      ...dto,
    });
    this.#lessons.push(lesson);
    return lesson;
  }

  update(id, dto) {
    const lesson = this.getById(id);
    if (!lesson) return null;
    Object.assign(lesson, dto);
    return lesson;
  }

  remove(id) {
    const i = this.#lessons.findIndex((l) => l.id === id);
    if (i === -1) return false;
    this.#lessons.splice(i, 1);
    return true;
  }

  /* Сброс для тестов */
  _clear() {
    this.#lessons = [];
    this.#nextId = 1;
  }
}

module.exports = new LessonRepository();

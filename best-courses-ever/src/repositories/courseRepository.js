const { Course } = require('../models');

class CourseRepository {
  #courses = [];
  #nextId = 1;

  /** Вернуть массив ВСЕХ курсов */
  getAll() {
    return this.#courses;
  }

  /** Найти один курс по ID или вернуть null */
  getById(id) {
    return this.#courses.find((c) => c.id === id) ?? null;
  }

  /** Создать новый курс и вернуть его */
  create(dto) {
    const course = new Course({ id: this.#nextId++, ...dto });
    this.#courses.push(course);
    return course;
  }

  /** Обновить поля курса; вернуть обновлённый объект или null */
  update(id, dto) {
    const course = this.getById(id);
    if (!course) return null;
    Object.assign(course, dto); // меняем только присланные поля
    return course;
  }

  /** Удалить курс — true/false в зависимости от результата */
  remove(id) {
    const idx = this.#courses.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.#courses.splice(idx, 1);
    return true;
  }

  /** Добавить ID урока в массив lessonIds */
  addLesson(courseId, lessonId) {
    const course = this.getById(courseId);
    if (!course) return null;
    course.lessonIds.push(lessonId);
    return course;
  }

  /** Пересчитать средний рейтинг (передаём готовое значение) */
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

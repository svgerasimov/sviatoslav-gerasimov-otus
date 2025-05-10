class Course {
  constructor({
    id,
    title,
    description,
    authorId,
    complexity = 'easy',
    createdAt = new Date(),
  }) {
    Object.assign(this, {
      id,
      title,
      description,
      authorId,
      complexity,
      createdAt,
    });
    this.lessonIds = [];
    this.rating = 0;
  }
}
module.exports = Course;

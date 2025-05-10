class Lesson {
  constructor({
    id,
    courseId,
    title,
    description = '',
    contentType = 'text', // 'text' | 'video' | 'link' | 'file'
    content = '',
    resources = [],
    createdAt = new Date(),
  }) {
    Object.assign(this, {
      id,
      courseId,
      title,
      description,
      contentType,
      content,
      resources,
      createdAt,
    });
  }
}

module.exports = Lesson;

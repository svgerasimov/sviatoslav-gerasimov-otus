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
    if (typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid lesson ID');
    }

    const validContentTypes = ['text', 'video', 'link', 'file'];
    if (!validContentTypes.includes(contentType)) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    if (!Array.isArray(resources)) {
      throw new Error('Resources must be an array');
    }

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

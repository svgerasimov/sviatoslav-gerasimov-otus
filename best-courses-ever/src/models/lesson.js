const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['video', 'document', 'link', 'code', 'quiz'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: function () {
      return ['video', 'document', 'link'].includes(this.type);
    },
  },
  content: {
    type: String,
    required: function () {
      return ['code', 'quiz'].includes(this.type);
    },
  },
  duration: {
    type: Number,
    default: 0,
  },
});

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Название урока обязательно'],
      trim: true,
      maxlength: [200, 'Название не может быть длиннее 200 символов'],
    },
    description: {
      type: String,
      maxlength: [
        1000,
        'Описание не может быть длиннее 1000 символов',
      ],
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    resources: [resourceSchema],
    duration: {
      type: Number,
      default: 0,
    },
    isPreview: {
      type: Boolean,
      default: false, // Можно ли просматривать без доступа к курсу
    },
    completedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Индекс для ускорения поиска уроков по курсу и порядку
lessonSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);

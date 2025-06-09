const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Название курса обязательно'],
      trim: true,
      maxlength: [200, 'Название не может быть длиннее 200 символов'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Описание курса обязательно'],
      maxlength: [
        2000,
        'Описание не может быть длиннее 2000 символов',
      ],
    },
    shortDescription: {
      type: String,
      maxlength: [
        300,
        'Краткое описание не может быть длиннее 300 символов',
      ],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner',
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    category: {
      type: String,
      enum: [
        'programming',
        'design',
        'business',
        'marketing',
        'other',
      ],
      default: 'other',
    },
    thumbnail: {
      type: String,
      default: null,
    },
    duration: {
      type: Number, // Продолжительность в минутах
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Цена не может быть отрицательной'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    allowedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    stats: {
      views: { type: Number, default: 0 },
      enrollments: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      totalRatings: { type: Number, default: 0 },
    },
    prerequisites: [
      {
        type: String,
      },
    ],
    learningOutcomes: [
      {
        type: String,
      },
    ],
    publishedAt: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Виртуальное поле для количества уроков
courseSchema.virtual('lessonsCount', {
  ref: 'Lesson',
  localField: '_id',
  foreignField: 'course',
  count: true,
});

// Генерация slug из названия
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Индексы для поиска
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ author: 1, createdAt: -1 });
courseSchema.index({ tags: 1 });

module.exports = mongoose.model('Course', courseSchema);
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Текст комментария обязателен'],
      trim: true,
      maxlength: [
        1000,
        'Комментарий не может быть длиннее 1000 символов',
      ],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['course', 'lesson'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetModel',
    },
    targetModel: {
      type: String,
      enum: ['Course', 'Lesson'],
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Индексы для быстрого поиска комментариев
commentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

// Виртуальное поле для количества лайков
commentSchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// Метод для проверки, лайкнул ли пользователь комментарий
commentSchema.methods.isLikedBy = function (userId) {
  return this.likes.includes(userId);
};

module.exports = mongoose.model('Comment', commentSchema);

const { v4: uuidv4 } = require('uuid');
const { model, Schema } = require('mongoose');
const { ObjectId } = Schema.Types;

const courseSchema = new Schema(
  {
    id: {
      type: String,
      default: uuidv4,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    authorId: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    complexity: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'easy',
    },
    lessonIds: [
      {
        type: ObjectId,
        ref: 'Lesson',
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created', updatedAt: 'modified' },
    versionKey: false,
    strict: 'throw',
  }
);

module.exports = model('Course', courseSchema);

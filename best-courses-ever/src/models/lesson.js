const { v4: uuidv4 } = require('uuid');
const { model, Schema } = require('mongoose');
const { ObjectId } = Schema.Types;

const lessonSchema = new Schema(
  {
    id: {
      type: String,
      default: uuidv4,
    },
    courseId: {
      type: ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    contentType: {
      type: String,
      enum: ['text', 'video', 'link', 'file'],
      default: 'text',
    },
    content: {
      type: String,
      default: '',
    },
    resources: [
      {
        type: String,
        default: [],
      },
    ],
  },
  {
    timestamps: { createdAt: 'created', updatedAt: 'modified' },
    versionKey: false,
    strict: 'throw',
  }
);
const Lesson = model('Lesson', lessonSchema);
module.exports = Lesson;

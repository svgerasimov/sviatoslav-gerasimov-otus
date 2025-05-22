const { v4: uuidv4 } = require('uuid');
const { model, Schema } = require('mongoose');
const { ObjectId } = Schema.Types;

const userSchema = new Schema(
  {
    id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
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
const User = model('User', userSchema);
module.exports = User;

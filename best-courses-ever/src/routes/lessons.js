const express = require('express');
const ctrl = require('../controllers/lessonController');

const router = express.Router({ mergeParams: true }); // нужно, чтобы видеть :courseId из courses.js

router.get('/', ctrl.listJSON); // GET /courses/:courseId/lessons
router.post('/', ctrl.createJSON); // POST …
router.get('/:lessonId', ctrl.showJSON); // GET  /courses/:courseId/lessons/:lessonId

module.exports = router;

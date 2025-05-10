const express = require('express');
const courseCtrl = require('../controllers/courseController');
const lessonsRouter = require('./lessons');

const router = express.Router();

// HTML список курсов
router.get('/', courseCtrl.listPage); // GET  /courses

// JSON-API
router.get('/api', courseCtrl.listJSON); // GET  /courses/api
router.post('/api', courseCtrl.createJSON); // POST /courses/api
router.get('/api/:id', courseCtrl.showJSON); // GET  /courses/api/42
router.put('/api/:id', courseCtrl.updateJSON); // PUT  /courses/api/42
router.delete('/api/:id', courseCtrl.deleteJSON); // DELETE /courses/api/42

//  Уроки
router.use('/:courseId/lessons', lessonsRouter); // вложенный путь

//  HTML страница одного курса
router.get('/:id', courseCtrl.showPage); // GET  /courses/42

module.exports = router;

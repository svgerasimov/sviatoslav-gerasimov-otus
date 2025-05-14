const express = require('express');
const ctrl = require('../controllers/authController');

const router = express.Router();

// HTML-страницы
router.get('/login', ctrl.loginPage);
router.get('/register', ctrl.registerPage);

// JSON-API
router.post('/api/register', ctrl.register);
router.post('/api/login', ctrl.login);
router.post('/api/logout', ctrl.logout);

module.exports = router;

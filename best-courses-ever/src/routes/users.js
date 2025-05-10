const express = require('express');
const userCtrl = require('../controllers/userController');

const router = express.Router();

// JSON-API
router.get('/api', userCtrl.listJSON); // GET /users/api
router.get('/api/:id', userCtrl.showJSON); // GET /users/api/42

module.exports = router;

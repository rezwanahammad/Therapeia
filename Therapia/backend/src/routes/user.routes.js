const express = require('express');
const router = express.Router();
const { createUser, updateUser, listUsers, findUser } = require('../controllers/user.controller');

// Basic users CRUD endpoints
router.get('/', listUsers);
router.get('/find', findUser);
router.post('/', createUser);
router.put('/:id', updateUser);

module.exports = router;
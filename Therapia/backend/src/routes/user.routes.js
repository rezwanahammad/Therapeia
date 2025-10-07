const express = require('express');
const router = express.Router();
const { createUser, updateUser, listUsers, findUser, getCart, addToCart, updateCartItem, removeCartItem } = require('../controllers/user.controller');

// Basic users CRUD endpoints
router.get('/', listUsers);
router.get('/find', findUser);
router.post('/', createUser);
router.put('/:id', updateUser);

// Cart endpoints
router.get('/:id/cart', getCart);
router.post('/:id/cart', addToCart);
router.put('/:id/cart/:itemId', updateCartItem);
router.delete('/:id/cart/:itemId', removeCartItem);

module.exports = router;
const express = require('express');
const router = express.Router();
const { listProducts, createProduct } = require('../controllers/product.controller');

router.get('/', listProducts);
router.post('/', createProduct);

module.exports = router;
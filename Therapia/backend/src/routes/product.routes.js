const express = require('express');
const router = express.Router();
const { listProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');

router.get('/', listProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
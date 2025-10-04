const Product = require('../models/product');

// GET /api/products
async function listProducts(req, res, next) {
  try {
    const products = await Product.find({}).lean();
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

// POST /api/products (basic placeholder)
async function createProduct(req, res, next) {
  try {
    const body = req.body || {};
    const product = await Product.create(body);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, createProduct };
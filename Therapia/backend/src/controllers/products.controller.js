const Product = require('../models/product');

// GET /api/products
exports.listProducts = async (req, res, next) => {
  try {
    const { q, limit } = req.query;
    const query = {};
    if (q) {
      query.$text = { $search: q };
    }
    const cursor = Product.find(query).sort({ createdAt: -1 });
    if (limit) {
      cursor.limit(Number(limit));
    }
    const items = await cursor.exec();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Product.findById(id).exec();
    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
};
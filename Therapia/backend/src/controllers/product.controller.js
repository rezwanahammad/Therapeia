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
    // Basic required fields extraction to prevent unexpected payloads
    const payload = {
      name: body.name,
      generic: body.generic,
      price: body.price,
      company: body.company,
      inventory: body.inventory,
      dosageForm: body.dosageForm,
      strength: body.strength,
      isPrescriptionRequired: !!body.isPrescriptionRequired,
      imageUrl: body.imageUrl,
      safety: body.safety,
      category: body.category,
    };
    const product = await Product.create(payload);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id
async function updateProduct(req, res, next) {
  try {
    const id = req.params.id;
    const body = req.body || {};
    const payload = {
      name: body.name,
      generic: body.generic,
      price: body.price,
      company: body.company,
      inventory: body.inventory,
      dosageForm: body.dosageForm,
      strength: body.strength,
      isPrescriptionRequired: !!body.isPrescriptionRequired,
      imageUrl: body.imageUrl,
      safety: body.safety,
      category: body.category,
    };
    const updated = await Product.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json({ product: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res, next) {
  try {
    const id = req.params.id;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, createProduct, updateProduct, deleteProduct };
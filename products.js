const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Analytics = require('../models/Analytics');
const adminAuth = require('../middleware/adminAuth');

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/* ------------------------------------------------------------------ */
/* PUBLIC ROUTES (used by the customer-facing storefront)             */
/* ------------------------------------------------------------------ */

// GET /api/products - list products, optional filters
// query params: category=Bridal|Evening|Engagement, status=Available|Rented|Sold Out, search=text
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id - single product detail
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid product id' });
  }
});

// POST /api/products/:id/like - increment the wishlist/like counter (public, no auth)
router.post('/:id/like', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // roll into today's analytics aggregate
    await Analytics.findOneAndUpdate(
      { date: todayKey() },
      { $inc: { likes: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, likes: product.likes });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Invalid product id' });
  }
});

/* ------------------------------------------------------------------ */
/* ADMIN-ONLY ROUTES (require x-admin-key header)                     */
/* ------------------------------------------------------------------ */

// POST /api/products - create a new product
router.post('/', adminAuth, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id - full update of a product
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/products/:id/status - quick inventory status toggle
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Available', 'Rented', 'Sold Out'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

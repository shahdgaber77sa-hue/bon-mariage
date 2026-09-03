const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Product = require('../models/Product');
const Analytics = require('../models/Analytics');
const adminAuth = require('../middleware/adminAuth');

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* PUBLIC: submit a fitting appointment request from the storefront    */
/* ------------------------------------------------------------------ */

// POST /api/appointments
router.post('/', async (req, res) => {
  try {
    const { clientName, phone, email, productId, date, timeSlot, notes } = req.body;

    if (!clientName || !phone || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'clientName, phone, date and timeSlot are required'
      });
    }

    let productTitleSnapshot = '';
    if (productId) {
      const product = await Product.findById(productId);
      if (product) productTitleSnapshot = product.title;
    }

    const appointment = await Appointment.create({
      clientName,
      phone,
      email,
      product: productId || null,
      productTitleSnapshot,
      date,
      timeSlot,
      notes
    });

    await Analytics.findOneAndUpdate(
      { date: todayKey() },
      { $inc: { appointmentRequests: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/* ------------------------------------------------------------------ */
/* ADMIN-ONLY: manage appointments                                     */
/* ------------------------------------------------------------------ */

// GET /api/appointments - list all, optional ?status= filter
router.get('/', adminAuth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const appointments = await Appointment.find(filter)
      .populate('product', 'title imageUrl sku')
      .sort({ date: 1, timeSlot: 1 });

    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/appointments/:id - update status/details
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

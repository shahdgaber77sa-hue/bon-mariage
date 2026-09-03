const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Product = require('../models/Product');
const Appointment = require('../models/Appointment');
const adminAuth = require('../middleware/adminAuth');

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/* ------------------------------------------------------------------ */
/* PUBLIC: log a page visit (called once per storefront page load)     */
/* ------------------------------------------------------------------ */

// POST /api/analytics/visit
router.post('/visit', async (req, res) => {
  try {
    await Analytics.findOneAndUpdate(
      { date: todayKey() },
      { $inc: { visits: 1, pageViews: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    // analytics failures should never break the storefront
    res.json({ success: false });
  }
});

/* ------------------------------------------------------------------ */
/* ADMIN-ONLY: dashboard summary                                       */
/* ------------------------------------------------------------------ */

// GET /api/analytics/summary
router.get('/summary', adminAuth, async (req, res) => {
  try {
    const today = todayKey();

    const [todayDoc, last7Days, mostLiked, appointmentCounts, productCounts] = await Promise.all([
      Analytics.findOne({ date: today }),
      Analytics.find().sort({ date: -1 }).limit(7),
      Product.find().sort({ likes: -1 }).limit(5).select('title imageUrl likes category status'),
      Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);

    const appointmentsByStatus = { Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
    appointmentCounts.forEach((row) => {
      appointmentsByStatus[row._id] = row.count;
    });

    const productsByStatus = { Available: 0, Rented: 0, 'Sold Out': 0 };
    productCounts.forEach((row) => {
      productsByStatus[row._id] = row.count;
    });

    const totalVisitsAllTime = await Analytics.aggregate([
      { $group: { _id: null, total: { $sum: '$visits' } } }
    ]);

    res.json({
      success: true,
      data: {
        today: todayDoc || { visits: 0, pageViews: 0, likes: 0, appointmentRequests: 0 },
        last7Days: last7Days.reverse(),
        totalVisitsAllTime: totalVisitsAllTime[0]?.total || 0,
        mostLikedProducts: mostLiked,
        appointmentsByStatus,
        productsByStatus,
        totalProducts: Object.values(productsByStatus).reduce((a, b) => a + b, 0),
        totalAppointments: Object.values(appointmentsByStatus).reduce((a, b) => a + b, 0)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

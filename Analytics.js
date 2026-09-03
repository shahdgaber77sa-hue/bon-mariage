const mongoose = require('mongoose');

/**
 * One document per calendar day (UTC), incremented as events come in.
 * Keeping this aggregate-per-day rather than an event-per-row log keeps
 * the collection small and the dashboard queries fast.
 */
const analyticsSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      unique: true
    },
    visits: {
      type: Number,
      default: 0
    },
    pageViews: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    appointmentRequests: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);

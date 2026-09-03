const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "Client's name is required"],
      trim: true,
      maxlength: 100
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: 30
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    productTitleSnapshot: {
      // stored redundantly so the appointment record still makes sense
      // even if the product is later edited or removed
      type: String,
      default: ''
    },
    date: {
      type: String, // stored as YYYY-MM-DD
      required: [true, 'Appointment date is required']
    },
    timeSlot: {
      type: String, // e.g. "14:30"
      required: [true, 'A time slot is required']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    source: {
      type: String,
      default: 'website'
    }
  },
  { timestamps: true }
);

appointmentSchema.index({ date: 1, timeSlot: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);

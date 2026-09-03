const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    imageUrl: {
      type: String,
      required: [true, 'An image URL is required'],
      trim: true
    },
    // Optional gallery for extra angles/detail shots
    gallery: {
      type: [String],
      default: []
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    // e.g. rental deposit / rental price, separate from purchase price
    rentalPrice: {
      type: Number,
      min: 0,
      default: null
    },
    sizes: {
      type: [String],
      enum: ['S', 'M', 'L', 'XL'],
      default: []
    },
    category: {
      type: String,
      enum: ['Bridal', 'Evening', 'Engagement'],
      required: true
    },
    status: {
      type: String,
      enum: ['Available', 'Rented', 'Sold Out'],
      default: 'Available'
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

productSchema.index({ category: 1, status: 1 });
productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);

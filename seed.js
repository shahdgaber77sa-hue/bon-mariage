/**
 * Run with: npm run seed
 * Populates the database with a handful of sample products so the
 * storefront and admin dashboard aren't empty on first run.
 * Safe to run multiple times — it clears existing products first.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

const sampleProducts = [
  {
    title: 'Royal Lace Bridal Gown',
    description: 'Hand-embroidered lace bodice with a cathedral train, designed for a grand entrance.',
    imageUrl: 'https://placehold.co/800x1000/1c1c1c/d4af37?text=Royal+Lace+Gown',
    price: 2400,
    rentalPrice: 650,
    sizes: ['S', 'M', 'L'],
    category: 'Bridal',
    status: 'Available',
    sku: 'BM-B01',
    featured: true
  },
  {
    title: 'Champagne Silk Evening Gown',
    description: 'Fluid silk column dress with a subtle side slit, perfect for evening receptions.',
    imageUrl: 'https://placehold.co/800x1000/1c1c1c/d4af37?text=Silk+Evening+Gown',
    price: 890,
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'Evening',
    status: 'Available',
    sku: 'BM-E01'
  },
  {
    title: 'Blush Engagement Dress',
    description: 'Soft tulle skirt with a fitted beaded top, made for the engagement announcement.',
    imageUrl: 'https://placehold.co/800x1000/1c1c1c/d4af37?text=Engagement+Dress',
    price: 650,
    sizes: ['S', 'M'],
    category: 'Engagement',
    status: 'Rented',
    sku: 'BM-EN01'
  },
  {
    title: 'Classic Mermaid Bridal Gown',
    description: 'Structured mermaid silhouette in duchess satin with a chapel-length veil included.',
    imageUrl: 'https://placehold.co/800x1000/1c1c1c/d4af37?text=Mermaid+Gown',
    price: 3100,
    rentalPrice: 780,
    sizes: ['M', 'L', 'XL'],
    category: 'Bridal',
    status: 'Sold Out',
    sku: 'BM-B02'
  }
];

(async () => {
  await connectDB();
  console.log('🧹 Clearing existing products...');
  await Product.deleteMany({});
  console.log('🌱 Inserting sample products...');
  await Product.insertMany(sampleProducts);
  console.log(`✅ Seeded ${sampleProducts.length} products.`);
  await mongoose.connection.close();
  process.exit(0);
})();

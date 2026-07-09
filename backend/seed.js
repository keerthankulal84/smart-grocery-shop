// Run with: node seed.js
// Populates the database with sample grocery products for testing.
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const sampleProducts = [
  { name: 'Bananas', category: 'Fruits', price: 40, unit: '1 dozen', stock: 100, description: 'Fresh ripe bananas', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400' },
  { name: 'Apples', category: 'Fruits', price: 180, unit: '1 kg', stock: 80, description: 'Crisp red apples', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400' },
  { name: 'Tomatoes', category: 'Vegetables', price: 30, unit: '1 kg', stock: 120, description: 'Farm fresh tomatoes', image: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400' },
  { name: 'Onions', category: 'Vegetables', price: 35, unit: '1 kg', stock: 150, description: 'Fresh onions', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400' },
  { name: 'Milk', category: 'Dairy', price: 60, unit: '1 litre', stock: 60, description: 'Full cream milk', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
  { name: 'Eggs', category: 'Dairy', price: 90, unit: '1 dozen', stock: 90, description: 'Farm fresh eggs', image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' },
  { name: 'Brown Bread', category: 'Bakery', price: 45, unit: '1 loaf', stock: 40, description: 'Whole wheat bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  { name: 'Basmati Rice', category: 'Grains', price: 120, unit: '1 kg', stock: 70, description: 'Premium basmati rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  { name: 'Toor Dal', category: 'Grains', price: 140, unit: '1 kg', stock: 65, description: 'Split pigeon peas', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
  { name: 'Sunflower Oil', category: 'Cooking Essentials', price: 150, unit: '1 litre', stock: 50, description: 'Refined sunflower oil', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
  { name: 'Potato Chips', category: 'Snacks', price: 20, unit: '1 pack', stock: 200, description: 'Crunchy salted chips', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
  { name: 'Orange Juice', category: 'Beverages', price: 110, unit: '1 litre', stock: 45, description: '100% fresh orange juice', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' }
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing existing products...');
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log(`Inserted ${sampleProducts.length} sample products.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

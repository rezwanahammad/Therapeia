require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

const makeSafety = () => ({
  alcohol:       { status: 'unknown', en: '', bn: '' },
  pregnancy:     { status: 'unknown', en: '', bn: '' },
  breastfeeding: { status: 'unknown', en: '', bn: '' },
  driving:       { status: 'unknown', en: '', bn: '' },
  kidney:        { status: 'unknown', en: '', bn: '' },
  liver:         { status: 'unknown', en: '', bn: '' },
});

const mockProducts = [
  { name: 'Paracetamol 500mg', price: 15.5, imageUrl: 'https://via.placeholder.com/200x200/4CAF50/white?text=Paracetamol', category: 'Medicine', inStock: true },
  { name: 'Vitamin D3 Tablets', price: 45.0, imageUrl: 'https://via.placeholder.com/200x200/2196F3/white?text=Vitamin+D3', category: 'Supplement', inStock: true },
  { name: 'Hand Sanitizer 250ml', price: 25.0, imageUrl: 'https://via.placeholder.com/200x200/FF9800/white?text=Sanitizer', category: 'Healthcare', inStock: true },
  { name: 'Baby Lotion 200ml', price: 35.0, imageUrl: 'https://via.placeholder.com/200x200/E91E63/white?text=Baby+Lotion', category: 'Baby & Mom Care', inStock: true },
  { name: 'Turmeric Capsules', price: 28.0, imageUrl: 'https://via.placeholder.com/200x200/795548/white?text=Turmeric', category: 'Herbal', inStock: true },
  { name: 'Face Cream SPF 30', price: 55.0, imageUrl: 'https://via.placeholder.com/200x200/9C27B0/white?text=Face+Cream', category: 'Beauty', inStock: true },
  { name: 'Antiseptic Liquid 500ml', price: 18.0, imageUrl: 'https://via.placeholder.com/200x200/607D8B/white?text=Antiseptic', category: 'Home Care', inStock: true },
  { name: 'Dog Shampoo 300ml', price: 32.0, imageUrl: 'https://via.placeholder.com/200x200/8BC34A/white?text=Dog+Shampoo', category: 'Pet Care', inStock: true },
  { name: 'Hair Oil 100ml', price: 120.0, imageUrl: 'https://via.placeholder.com/200x200/00BCD4/white?text=Hair+Oil', category: 'Beauty', inStock: true },
];

const toDbProduct = (p) => ({
  name: p.name,
  generic: p.name, // placeholder; real generic can be set later
  price: p.price,
  company: 'Therapeia',
  inventory: p.inStock ? 100 : 0,
  safety: makeSafety(),
  imageUrl: p.imageUrl,
  dosageForm: 'tablet',
  strength: '',
  isPrescriptionRequired: false,
});

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  // Allow invalid TLS certs for local/dev environments where corporate proxies or antivirus
  // can break Atlas TLS handshakes. Do not use in production.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000, tlsAllowInvalidCertificates: true });
  console.log('Connected to MongoDB');

  try {
    const docs = mockProducts.map(toDbProduct);
    // Upsert by name to avoid duplicates
    for (const doc of docs) {
      await Product.updateOne({ name: doc.name }, { $set: doc }, { upsert: true });
      console.log(`Upserted: ${doc.name}`);
    }
    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

run();
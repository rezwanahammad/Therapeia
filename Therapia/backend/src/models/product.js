// models/Product.js
const mongoose = require('mongoose');

const SafetyItemSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['safe', 'unsafe', 'caution', 'safe_if_prescribed', 'unknown'],
      default: 'unknown'
    },
    en: { type: String, default: '' },  // English note (shown in your UI)
    bn: { type: String, default: '' }   // Bangla note (optional)
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    // 1) Medicine Name
    name: { type: String, required: true, trim: true },          // e.g., "Napa 500"

    // 2) Generic
    generic: { type: String, required: true, trim: true },       // e.g., "Paracetamol"

    // 3) Price
    price: { type: Number, required: true, min: 0 },             // BDT numeric

    // 4) Company
    company: { type: String, required: true, trim: true },       // e.g., "Beximco"

    // 5) Inventory
    inventory: { type: Number, required: true, min: 0 },         // current stock qty

    // 6) Safety Advices (flat object with fixed keys from your screenshot)
    safety: {
      alcohol:       { type: SafetyItemSchema, required: true },
      pregnancy:     { type: SafetyItemSchema, required: true },
      breastfeeding: { type: SafetyItemSchema, required: true },
      driving:       { type: SafetyItemSchema, required: true },
      kidney:        { type: SafetyItemSchema, required: true },
      liver:         { type: SafetyItemSchema, required: true }
    },

    // 7) Product photo link
    imageUrl: { type: String, required: true, trim: true },

    // 8) Category
    category: { type: String, required: true, trim: true },

    // tiny extras (optional)
    dosageForm: { type: String, default: 'tablet' },             // tablet/syrup/etc.
    strength: { type: String, default: '' },                     // e.g., "500 mg"
    isPrescriptionRequired: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// helpful basic indexes
ProductSchema.index({ name: 'text', generic: 'text', company: 'text' });

module.exports = mongoose.model('product', ProductSchema);

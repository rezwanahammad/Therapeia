const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    auth: {
      passwordHash: { type: String, select: false },
      emailVerified: { type: Boolean, default: false }
    },
    lastLoginAt: { type: Date },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('admin', AdminSchema);
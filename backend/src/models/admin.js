const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    name: { type: String, trim: true },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    auth: {
      passwordHash: { type: String, select: false },
      lastLoginAt: { type: Date },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('admin', AdminSchema);
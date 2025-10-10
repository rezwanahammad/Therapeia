const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled'], required: true },
  at: { type: Date, default: Date.now },
  note: { type: String },
  actorType: { type: String, enum: ['user', 'admin'], required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId },
  meta: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const AuditEntrySchema = new mongoose.Schema({
  type: { type: String, enum: ['status_change', 'update_tracking', 'cancel'], required: true },
  at: { type: Date, default: Date.now },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
  details: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const TrackingSchema = new mongoose.Schema({
  carrier: { type: String },
  trackingNumber: { type: String },
  url: { type: String },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  items: { type: [OrderItemSchema], default: [] },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'canceled'], default: 'pending' },
  statusHistory: { type: [StatusHistorySchema], default: [] },
  tracking: { type: TrackingSchema, default: {} },
  audit: { type: [AuditEntrySchema], default: [] },
  canceledReason: { type: String },
}, { timestamps: true });

OrderSchema.methods.addStatus = function(status, note, actorType, actorId, meta) {
  this.status = status;
  this.statusHistory.push({ status, note, actorType, actorId, meta, at: new Date() });
};

// Define allowed transitions for basic integrity
const ALLOWED_TRANSITIONS = {
  pending: ['processing', 'canceled'],
  processing: ['shipped', 'canceled'],
  shipped: ['delivered'],
  delivered: [],
  canceled: [],
};

OrderSchema.methods.canTransitionTo = function(next) {
  const allowed = ALLOWED_TRANSITIONS[this.status] || [];
  return allowed.includes(next);
};

module.exports = mongoose.model('order', OrderSchema);
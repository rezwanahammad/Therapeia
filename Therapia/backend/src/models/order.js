const mongoose = require('mongoose')

const OrderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
)

const AddressSnapshotSchema = new mongoose.Schema(
  {
    label: { type: String },
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
  { _id: false }
)

const StatusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
)

const AuditEntrySchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    at: { type: Date, default: Date.now },
    details: { type: Object },
  },
  { _id: false }
)

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    items: { type: [OrderItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'canceled'], default: 'placed' },
    paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    paymentMethod: { type: String, enum: ['Bank', 'Bkash', 'Nagad', 'Unknown'], default: 'Unknown' },
    trackingNumber: { type: String },
    shippingAddress: { type: AddressSnapshotSchema },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    audit: { type: [AuditEntrySchema], default: [] },
  },
  { timestamps: true }
)

module.exports = mongoose.model('order', OrderSchema)
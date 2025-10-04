const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'home' },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, default: '', trim: true },
    postalCode: { type: String, default: '', trim: true },
    country: { type: String, default: 'Bangladesh', trim: true },
    isDefault: { type: Boolean, default: false }
  },
  { _id: false }
);

const EmergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  { _id: false }
);

const MedicalSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'unknown'],
      default: 'unknown'
    },
    allergies: [{ type: String, trim: true }],
    conditions: [{ type: String, trim: true }],
    medications: [{ type: String, trim: true }],
    notes: { type: String, trim: true }
  },
  { _id: false }
);

const InsuranceSchema = new mongoose.Schema(
  {
    provider: { type: String, trim: true },
    policyNumber: { type: String, trim: true },
    groupNumber: { type: String, trim: true },
    validThrough: { type: Date }
  },
  { _id: false }
);

const PreferencesSchema = new mongoose.Schema(
  {
    sms: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    marketingOptIn: { type: Boolean, default: false }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: { type: String, required: true, trim: true, unique: true },
    altPhone: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_say'], default: 'prefer_not_say' },
    dateOfBirth: { type: Date },

    addresses: { type: [AddressSchema], default: [] },
    emergencyContact: { type: EmergencyContactSchema, default: {} },
    medical: { type: MedicalSchema, default: {} },
    insurance: { type: InsuranceSchema, default: {} },

    idDocs: {
      nationalIdNumber: { type: String, trim: true },
      passportNumber: { type: String, trim: true },
      driverLicenseNumber: { type: String, trim: true }
    },

    auth: {
      passwordHash: { type: String, select: false },
      emailVerified: { type: Boolean, default: false }
    },

    preferences: { type: PreferencesSchema, default: {} }
  },
  { timestamps: true }
);

// Indexes are already defined via `unique: true` on email and phone

module.exports = mongoose.model('user', UserSchema);
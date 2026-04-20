import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      required: [true, 'Short name is required'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    welcomeMessage: {
      type: String,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    contactPerson: {
      name: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      phoneCountry: {
        type: String,
        trim: true,
      },
    },
    address: {
      country: { type: String, trim: true },
      state: { type: String, trim: true },
      city: { type: String, trim: true },
      addressLine: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for institutions count
customerSchema.virtual('institutions', {
  ref: 'Institution',
  localField: '_id',
  foreignField: 'customerAccount',
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;

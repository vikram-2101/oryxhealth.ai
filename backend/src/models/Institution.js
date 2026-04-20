import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Account ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Institution name is required'],
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
      }
    },
    address: {
      country: { type: String, trim: true },
      state: { type: String, trim: true },
      city: { type: String, trim: true },
      addressLine: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    pan: {
      type: String,
      trim: true,
    },
    gst: {
      type: String,
      trim: true,
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

// Virtual for users count
institutionSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'institution',
});

const Institution = mongoose.model('Institution', institutionSchema);

export default Institution;

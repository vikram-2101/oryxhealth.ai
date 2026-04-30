import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
      select: false,
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
    reportTemplate: {
      htmlContent: { type: String, default: null },
      fileName: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
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
  foreignField: 'accountId',
});

/* =========================================
   PASSWORD HASHING
========================================= */
customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Allow partial updates (findOneAndUpdate) to also hash the password
customerSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 12);
  } else if (update.$set && update.$set.password) {
    update.$set.password = await bcrypt.hash(update.$set.password, 12);
  }
  this.setUpdate(update);
  next();
});

customerSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;

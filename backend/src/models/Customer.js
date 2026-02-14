import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
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

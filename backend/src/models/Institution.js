import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
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
    customerAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer account is required'],
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

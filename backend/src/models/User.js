import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['Doctor', 'Health Worker', 'Coordinator'],
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution is required'],
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    signatureImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Validation: registrationNumber required if role is Doctor
userSchema.pre('save', function (next) {
  if (this.role === 'Doctor' && !this.registrationNumber) {
    return next(new Error('Registration number is required for Doctors'));
  }
  next();
});

userSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const role = update.role || update.$set?.role;
  const registrationNumber = update.registrationNumber || update.$set?.registrationNumber;
  
  if (role === 'Doctor' && !registrationNumber) {
    return next(new Error('Registration number is required for Doctors'));
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;

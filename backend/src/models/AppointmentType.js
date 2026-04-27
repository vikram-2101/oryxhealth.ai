import mongoose from 'mongoose';

const appointmentTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Account ID is required'],
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

// Unique name per account
appointmentTypeSchema.index({ name: 1, accountId: 1 }, { unique: true });

const AppointmentType = mongoose.model('AppointmentType', appointmentTypeSchema);

export default AppointmentType;

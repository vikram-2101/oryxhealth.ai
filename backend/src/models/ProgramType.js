import mongoose from 'mongoose';

const programTypeSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Account ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Program type name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

programTypeSchema.index({ accountId: 1, name: 1 }, { unique: true });

const ProgramType = mongoose.model('ProgramType', programTypeSchema);
export default ProgramType;

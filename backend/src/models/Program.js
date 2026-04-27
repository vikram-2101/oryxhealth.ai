import mongoose from 'mongoose';

const programSchema = new mongoose.Schema(
  {
    programTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProgramType',
      required: [true, 'Program Type ID is required'],
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Account ID is required'],
      index: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: false,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Program name is required'],
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

programSchema.index({ accountId: 1, programTypeId: 1, name: 1 }, { unique: true });

const Program = mongoose.model('Program', programSchema);
export default Program;

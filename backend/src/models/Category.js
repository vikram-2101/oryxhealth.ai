import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: false,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Account ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
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
    sex: {
      type: String,
      enum: ["Male", "Female", "Other", "Any"],
      default: "Any",
    },
    minAge: {
      type: Number,
      default: 0,
    },
    maxAge: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ accountId: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;

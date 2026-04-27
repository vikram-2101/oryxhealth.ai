import mongoose from 'mongoose';

const panelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Panel name is required'],
      trim: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Account is required'],
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution is required'],
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

// Validation: Prevent adding inactive users
panelSchema.pre('save', async function (next) {
  if (this.users && this.users.length > 0) {
    const User = mongoose.model('User');
    const users = await User.find({ _id: { $in: this.users } });
    const inactiveUsers = users.filter((user) => user.status === 'inactive');
    
    if (inactiveUsers.length > 0) {
      return next(new Error('Cannot add inactive users to panel'));
    }
  }
  next();
});

const Panel = mongoose.model('Panel', panelSchema);

export default Panel;

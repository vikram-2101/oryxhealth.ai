import AppointmentType from '../models/AppointmentType.js';

// @desc    Get all appointment types for an account
// @route   GET /api/appointment-types
// @access  Private
export const getAppointmentTypes = async (req, res) => {
  try {
    let filter = {};

    if (req.userRole === 'super_admin') {
      const { accountId } = req.query;
      if (accountId) filter.accountId = accountId;
    } else if (req.userRole === 'account') {
      filter.accountId = req.accountId;
    } else {
      // Other roles (institution) can see types for their account
      filter.accountId = req.accountId;
    }

    const types = await AppointmentType.find(filter).populate('accountId', 'name');
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an appointment type
// @route   POST /api/appointment-types
// @access  Private
export const createAppointmentType = async (req, res) => {
  try {
    let { name, accountId } = req.body;

    // Enforce accountId for non-super admins
    if (req.userRole !== 'super_admin') {
      accountId = req.accountId;
    }

    if (!accountId) {
      return res.status(400).json({ success: false, message: 'Account ID is required' });
    }

    const type = await AppointmentType.create({ name, accountId });
    res.status(201).json({ success: true, data: type });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Type already exists for this account' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an appointment type
// @route   PUT /api/appointment-types/:id
// @access  Private
export const updateAppointmentType = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.userRole !== 'super_admin') {
      filter.accountId = req.accountId;
    }

    const type = await AppointmentType.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });
    if (!type) {
      return res.status(404).json({ success: false, message: 'Type not found or unauthorized' });
    }
    res.json({ success: true, data: type });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an appointment type
// @route   DELETE /api/appointment-types/:id
// @access  Private
export const deleteAppointmentType = async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.userRole !== 'super_admin') {
      filter.accountId = req.accountId;
    }

    const type = await AppointmentType.findOneAndDelete(filter);
    if (!type) {
      return res.status(404).json({ success: false, message: 'Type not found or unauthorized' });
    }
    res.json({ success: true, message: 'Type deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

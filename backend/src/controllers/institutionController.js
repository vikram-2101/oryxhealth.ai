import Institution from '../models/Institution.js';
import User from '../models/User.js';

// @desc    Get all institutions
// @route   GET /api/institutions
// @access  Private
export const getInstitutions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;
    const customerAccount = req.query.customerAccount;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contactPerson.email': { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
    }
    if (customerAccount) {
      query.customerAccount = customerAccount;
    }

    const total = await Institution.countDocuments(query);
    const institutions = await Institution.find(query)
      .populate('customerAccount', 'name')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get user counts for each institution
    const institutionsWithCounts = await Promise.all(
      institutions.map(async (institution) => {
        const userCount = await User.countDocuments({
          institution: institution._id,
        });
        return {
          ...institution.toObject(),
          usersCount: userCount,
        };
      })
    );

    res.json({
      success: true,
      data: institutionsWithCounts,
      institutions: institutionsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single institution
// @route   GET /api/institutions/:id
// @access  Private
export const getInstitution = async (req, res, next) => {
  try {
    const institution = await Institution.findById(req.params.id).populate(
      'customerAccount',
      'name'
    );

    if (!institution) {
      res.status(404);
      throw new Error('Institution not found');
    }

    const users = await User.find({ institution: institution._id });

    res.json({
      success: true,
      data: {
        ...institution.toObject(),
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create institution
// @route   POST /api/institutions
// @access  Private
export const createInstitution = async (req, res, next) => {
  try {
    const institution = await Institution.create(req.body);
    await institution.populate('customerAccount', 'name');

    res.status(201).json({
      success: true,
      data: institution,
      message: 'Institution created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update institution
// @route   PUT /api/institutions/:id
// @access  Private
export const updateInstitution = async (req, res, next) => {
  try {
    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('customerAccount', 'name');

    if (!institution) {
      res.status(404);
      throw new Error('Institution not found');
    }

    res.json({
      success: true,
      data: institution,
      message: 'Institution updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete institution
// @route   DELETE /api/institutions/:id
// @access  Private
export const deleteInstitution = async (req, res, next) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      res.status(404);
      throw new Error('Institution not found');
    }

    // Check if institution has users
    const userCount = await User.countDocuments({
      institution: institution._id,
    });

    if (userCount > 0) {
      res.status(400);
      throw new Error('Cannot delete institution with associated users');
    }

    await institution.deleteOne();

    res.json({
      success: true,
      message: 'Institution deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle institution status
// @route   PATCH /api/institutions/:id/status
// @access  Private
export const toggleInstitutionStatus = async (req, res, next) => {
  try {
    const institution = await Institution.findById(req.params.id);

    if (!institution) {
      res.status(404);
      throw new Error('Institution not found');
    }

    institution.status =
      institution.status === 'active' ? 'inactive' : 'active';
    await institution.save();
    await institution.populate('customerAccount', 'name');

    res.json({
      success: true,
      data: institution,
      message: `Institution ${institution.status === 'active' ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

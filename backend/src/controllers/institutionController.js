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
    const accountId = req.query.accountId;

    const query = {};

    // ── Scope Filter ─────────────────────────────────────────────────────
    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    } else if (req.userRole === 'institution') {
      query._id = req.institutionId;
    } else if (accountId) {
      // Super Admin filtering by account
      query.accountId = accountId;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contactPerson.email': { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      query.status = status;
    }

    const total = await Institution.countDocuments(query);
    const institutions = await Institution.find(query)
      .populate('accountId', 'name')
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
    const query = { _id: req.params.id };

    // ── Scope Check ──────────────────────────────────────────────────────
    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    } else if (req.userRole === 'institution') {
      query._id = req.institutionId;
    }

    const institution = await Institution.findOne(query).populate(
      'accountId',
      'name'
    );

    if (!institution) {
      res.status(404);
      throw new Error('Institution not found or unauthorized');
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
    const institutionData = { ...req.body };

    // ── Forced Scope ──────────────────────────────────────────────────────
    if (req.userRole === 'account') {
      institutionData.accountId = req.accountId;
    }

    const institution = await Institution.create(institutionData);
    await institution.populate('accountId', 'name');

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
    const query = { _id: req.params.id };

    // ── Scope Check ──────────────────────────────────────────────────────
    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    } else if (req.userRole === 'institution') {
      query._id = req.institutionId;
    }

    // First find to check ownership
    const existingInstitution = await Institution.findOne(query);
    if (!existingInstitution) {
      res.status(404);
      throw new Error('Institution not found or unauthorized');
    }

    // Prevent changing the accountId unless Super Admin
    if (req.userRole !== 'super_admin') {
      delete req.body.accountId;
    }

    const institution = await Institution.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('accountId', 'name');

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
    const query = { _id: req.params.id };

    // ── Scope Check ──────────────────────────────────────────────────────
    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const institution = await Institution.findOne(query);

    if (!institution) {
      res.status(404);
      throw new Error('Institution not found or unauthorized');
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
    const query = { _id: req.params.id };

    // ── Scope Check ──────────────────────────────────────────────────────
    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const institution = await Institution.findOne(query);

    if (!institution) {
      res.status(404);
      throw new Error('Institution not found or unauthorized');
    }

    institution.status =
      institution.status === 'active' ? 'inactive' : 'active';
    await institution.save();
    await institution.populate('accountId', 'name');

    res.json({
      success: true,
      data: institution,
      message: `Institution ${institution.status === 'active' ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

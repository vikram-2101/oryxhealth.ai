import Panel from '../models/Panel.js';
import User from '../models/User.js';
import Institution from '../models/Institution.js';

// @desc    Get all panels
// @route   GET /api/panels
// @access  Private
export const getPanels = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;
    const institutionId = req.query.institutionId;
    const accountId = req.query.accountId;
    const sex = req.query.sex;

    const query = {};

    if (sex && sex !== 'Any') {
      query.sex = { $in: [sex, 'Any'] };
    }

    // ── Scope Filter ─────────────────────────────────────────────────────
    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    } else if (req.userRole === 'institution') {
      query.institutionId = req.institutionId;
    } else {
      // Super Admin
      if (accountId) query.accountId = accountId;
      if (institutionId) query.institutionId = institutionId;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }

    const total = await Panel.countDocuments(query);
    const panels = await Panel.find(query)
      .populate('users', 'firstName lastName name email role')
      .populate('institutionId', 'name')
      .populate('accountId', 'name')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: panels,
      panels: panels,
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

// @desc    Get single panel
// @route   GET /api/panels/:id
// @access  Private
export const getPanel = async (req, res, next) => {
  try {
    const panel = await Panel.findById(req.params.id)
      .populate('users', 'firstName lastName name email role institution')
      .populate('institutionId', 'name')
      .populate('accountId', 'name');

    if (!panel) {
      res.status(404);
      throw new Error('Panel not found');
    }

    // ── Scope Check ──────────────────────────────────────────────────────
    if (req.userRole === 'account') {
      if (panel.accountId.toString() !== req.accountId) {
        res.status(403);
        throw new Error('Not authorized to view this panel');
      }
    } else if (req.userRole === 'institution') {
      if (panel.institutionId.toString() !== req.institutionId) {
        res.status(403);
        throw new Error('Not authorized to view this panel');
      }
    }

    res.json({
      success: true,
      data: panel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create panel
// @route   POST /api/panels
// @access  Private
export const createPanel = async (req, res, next) => {
  try {
    const panelData = { ...req.body };

    // ── Forced Scope ──────────────────────────────────────────────────────
    if (req.userRole === 'institution') {
      panelData.institutionId = req.institutionId;
      // We might need to fetch accountId from institution here if not provided
    } else if (req.userRole === 'account') {
      panelData.accountId = req.accountId;
    }

    const panel = await Panel.create(panelData);
    await panel.populate('users', 'firstName lastName name email role');
    await panel.populate('institutionId', 'name');
    await panel.populate('accountId', 'name');

    res.status(201).json({
      success: true,
      data: panel,
      message: 'Panel created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update panel
// @route   PUT /api/panels/:id
// @access  Private
export const updatePanel = async (req, res, next) => {
  try {
    const panel = await Panel.findById(req.params.id);
    if (!panel) {
      res.status(404);
      throw new Error('Panel not found');
    }

    // ── Scope Check ──────────────────────────────────────────────────────
    if (req.userRole === 'account') {
      if (panel.accountId.toString() !== req.accountId) {
        res.status(403);
        throw new Error('Not authorized to update this panel');
      }
    } else if (req.userRole === 'institution') {
      if (panel.institutionId.toString() !== req.institutionId) {
        res.status(403);
        throw new Error('Not authorized to update this panel');
      }
    }

    const updatedPanel = await Panel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('users', 'firstName lastName name email role');

    res.json({
      success: true,
      data: updatedPanel,
      message: 'Panel updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete panel
// @route   DELETE /api/panels/:id
// @access  Private
export const deletePanel = async (req, res, next) => {
  try {
    const panel = await Panel.findById(req.params.id);

    if (!panel) {
      res.status(404);
      throw new Error('Panel not found');
    }

    // ── Scope Check ──────────────────────────────────────────────────────
    if (req.userRole === 'account') {
      if (panel.accountId.toString() !== req.accountId) {
        res.status(403);
        throw new Error('Not authorized to delete this panel');
      }
    } else if (req.userRole === 'institution') {
      if (panel.institutionId.toString() !== req.institutionId) {
        res.status(403);
        throw new Error('Not authorized to delete this panel');
      }
    }

    await panel.deleteOne();

    res.json({
      success: true,
      message: 'Panel deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle panel status
// @route   PATCH /api/panels/:id/status
// @access  Private
export const togglePanelStatus = async (req, res, next) => {
  try {
    const panel = await Panel.findById(req.params.id);

    if (!panel) {
      res.status(404);
      throw new Error('Panel not found');
    }

    // ── Scope Check ──────────────────────────────────────────────────────
    if (req.userRole !== 'super_admin') {
      let institutionIds = [];
      if (req.userRole === 'account') {
        const institutions = await Institution.find({ accountId: req.accountId }).select('_id');
        institutionIds = institutions.map(i => i._id.toString());
      } else {
        institutionIds = [req.institutionId.toString()];
      }

      const existingUsers = await User.find({ _id: { $in: panel.users } }).select('institution');
      const authorized = existingUsers.some(u => 
        u.institution && institutionIds.includes(u.institution.toString())
      );

      if (!authorized) {
        res.status(403);
        throw new Error('Not authorized to modify this panel');
      }
    }

    panel.status = panel.status === 'active' ? 'inactive' : 'active';
    await panel.save();
    await panel.populate('users', 'name email role');

    res.json({
      success: true,
      data: panel,
      message: `Panel ${panel.status === 'active' ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

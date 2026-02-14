import Panel from '../models/Panel.js';

// @desc    Get all panels
// @route   GET /api/panels
// @access  Private
export const getPanels = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (status) {
      query.status = status;
    }

    const total = await Panel.countDocuments(query);
    const panels = await Panel.find(query)
      .populate('users', 'name email role')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: panels,
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
    const panel = await Panel.findById(req.params.id).populate(
      'users',
      'name email role institution'
    );

    if (!panel) {
      res.status(404);
      throw new Error('Panel not found');
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
    const panel = await Panel.create(req.body);
    await panel.populate('users', 'name email role');

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
    const panel = await Panel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('users', 'name email role');

    if (!panel) {
      res.status(404);
      throw new Error('Panel not found');
    }

    res.json({
      success: true,
      data: panel,
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

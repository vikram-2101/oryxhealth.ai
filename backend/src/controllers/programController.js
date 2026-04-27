import Program from '../models/Program.js';

export const getPrograms = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const programTypeId = req.query.programTypeId;
    const accountId = req.query.accountId;

    const query = {};

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    } else if (accountId) {
      query.accountId = accountId;
    }

    if (programTypeId) {
      query.programTypeId = programTypeId;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Program.countDocuments(query);
    const programs = await Program.find(query)
      .populate('programTypeId', 'name')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: programs,
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

export const getProgram = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const program = await Program.findOne(query).populate('programTypeId', 'name');

    if (!program) {
      res.status(404);
      throw new Error('Program not found or unauthorized');
    }

    res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    next(error);
  }
};

export const createProgram = async (req, res, next) => {
  try {
    const programData = { ...req.body };

    if (req.userRole === 'account') {
      programData.accountId = req.accountId;
    }

    const program = await Program.create(programData);

    res.status(201).json({
      success: true,
      data: program,
      message: 'Program created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgram = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const existingProgram = await Program.findOne(query);
    if (!existingProgram) {
      res.status(404);
      throw new Error('Program not found or unauthorized');
    }

    if (req.userRole !== 'super_admin') {
      delete req.body.accountId;
    }

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: program,
      message: 'Program updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProgram = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const program = await Program.findOne(query);

    if (!program) {
      res.status(404);
      throw new Error('Program not found or unauthorized');
    }

    await program.deleteOne();

    res.json({
      success: true,
      message: 'Program deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

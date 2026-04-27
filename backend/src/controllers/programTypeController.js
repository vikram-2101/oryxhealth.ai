import ProgramType from '../models/ProgramType.js';

export const getProgramTypes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const accountId = req.query.accountId;

    const query = {};

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    } else if (accountId) {
      query.accountId = accountId;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await ProgramType.countDocuments(query);
    const programTypes = await ProgramType.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: programTypes,
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

export const getProgramType = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const programType = await ProgramType.findOne(query);

    if (!programType) {
      res.status(404);
      throw new Error('Program type not found or unauthorized');
    }

    res.json({
      success: true,
      data: programType,
    });
  } catch (error) {
    next(error);
  }
};

export const createProgramType = async (req, res, next) => {
  try {
    const programTypeData = { ...req.body };

    if (req.userRole === 'account') {
      programTypeData.accountId = req.accountId;
    }

    const programType = await ProgramType.create(programTypeData);

    res.status(201).json({
      success: true,
      data: programType,
      message: 'Program type created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgramType = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const existingType = await ProgramType.findOne(query);
    if (!existingType) {
      res.status(404);
      throw new Error('Program type not found or unauthorized');
    }

    if (req.userRole !== 'super_admin') {
      delete req.body.accountId;
    }

    const programType = await ProgramType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: programType,
      message: 'Program type updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProgramType = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const programType = await ProgramType.findOne(query);

    if (!programType) {
      res.status(404);
      throw new Error('Program type not found or unauthorized');
    }

    await programType.deleteOne();

    res.json({
      success: true,
      message: 'Program type deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

import Protocol from '../models/Protocol.js';

export const getProtocols = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const search = req.query.search || '';
    const accountId = req.query.accountId;
    const categoryId = req.query.categoryId;
    const sex = req.query.sex;

    const query = {};

    if (sex && sex !== 'Any') {
      query.sex = { $in: [sex, 'Any'] };
    }

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    } else if (accountId) {
      query.accountId = accountId;
    }

    if (categoryId) {
        query.categoryId = categoryId;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Protocol.countDocuments(query);
    const protocols = await Protocol.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: protocols,
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

export const getProtocol = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const protocol = await Protocol.findOne(query);

    if (!protocol) {
      res.status(404);
      throw new Error('Protocol not found or unauthorized');
    }

    res.json({
      success: true,
      data: protocol,
    });
  } catch (error) {
    next(error);
  }
};

export const createProtocol = async (req, res, next) => {
  try {
    const protocolData = { ...req.body };

    if (req.userRole === 'account') {
      protocolData.accountId = req.accountId;
    }

    const protocol = await Protocol.create(protocolData);

    res.status(201).json({
      success: true,
      data: protocol,
      message: 'Protocol created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateProtocol = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const existingProtocol = await Protocol.findOne(query);
    if (!existingProtocol) {
      res.status(404);
      throw new Error('Protocol not found or unauthorized');
    }

    if (req.userRole !== 'super_admin') {
      delete req.body.accountId;
    }

    const protocol = await Protocol.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: protocol,
      message: 'Protocol updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProtocol = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const protocol = await Protocol.findOne(query);

    if (!protocol) {
      res.status(404);
      throw new Error('Protocol not found or unauthorized');
    }

    await protocol.deleteOne();

    res.json({
      success: true,
      message: 'Protocol deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

import Category from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const accountId = req.query.accountId;
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

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const total = await Category.countDocuments(query);
    const categories = await Category.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: categories,
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

export const getCategory = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const category = await Category.findOne(query);

    if (!category) {
      res.status(404);
      throw new Error('Category not found or unauthorized');
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const categoryData = { ...req.body };

    if (req.userRole === 'account') {
      categoryData.accountId = req.accountId;
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const existingCategory = await Category.findOne(query);
    if (!existingCategory) {
      res.status(404);
      throw new Error('Category not found or unauthorized');
    }

    if (req.userRole !== 'super_admin') {
      delete req.body.accountId;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };

    if (req.userRole === 'account') {
      query.accountId = req.accountId;
    }

    const category = await Category.findOne(query);

    if (!category) {
      res.status(404);
      throw new Error('Category not found or unauthorized');
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

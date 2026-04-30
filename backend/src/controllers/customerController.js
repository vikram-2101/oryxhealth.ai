import Customer from '../models/Customer.js';
import Institution from '../models/Institution.js';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;

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

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get institution counts for each customer
    const customersWithCounts = await Promise.all(
      customers.map(async (customer) => {
        const institutionCount = await Institution.countDocuments({
          accountId: customer._id,
        });
        return {
          ...customer.toObject(),
          institutionsCount: institutionCount,
        };
      })
    );

    res.json({
      success: true,
      data: customersWithCounts,
      customers: customersWithCounts,
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

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
export const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }

    const institutions = await Institution.find({
      accountId: customer._id,
    });

    res.json({
      success: true,
      data: {
        ...customer.toObject(),
        institutions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }

    res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }

    // Check if customer has institutions
    const institutionCount = await Institution.countDocuments({
      accountId: customer._id,
    });

    if (institutionCount > 0) {
      res.status(400);
      throw new Error(
        'Cannot delete customer with associated institutions'
      );
    }

    await customer.deleteOne();

    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle customer status
// @route   PATCH /api/customers/:id/status
// @access  Private
export const toggleCustomerStatus = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }

    customer.status = customer.status === 'active' ? 'inactive' : 'active';
    await customer.save();

    res.json({
      success: true,
      data: customer,
      message: `Customer ${customer.status === 'active' ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / replace report template HTML for a customer
// @route   PUT /api/customers/:id/report-template
// @access  Private (Super Admin)
export const uploadReportTemplate = async (req, res, next) => {
  try {
    const { htmlContent, fileName } = req.body;

    if (!htmlContent) {
      res.status(400);
      throw new Error('htmlContent is required');
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        reportTemplate: {
          htmlContent,
          fileName: fileName || 'template.html',
          uploadedAt: new Date(),
          uploadedBy: req.user?._id || null,
        },
      },
      { new: true, runValidators: false }
    );

    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }

    res.json({
      success: true,
      message: 'Report template uploaded successfully',
      data: {
        fileName: customer.reportTemplate.fileName,
        uploadedAt: customer.reportTemplate.uploadedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get report template for a customer (by accountId)
// @route   GET /api/customers/:id/report-template
// @access  Private
export const getReportTemplate = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id).select('reportTemplate name');

    if (!customer) {
      res.status(404);
      throw new Error('Customer not found');
    }

    if (!customer.reportTemplate?.htmlContent) {
      return res.json({
        success: true,
        data: null,
        message: 'No report template configured for this account',
      });
    }

    res.json({
      success: true,
      data: customer.reportTemplate,
    });
  } catch (error) {
    next(error);
  }
};

import Customer from '../models/Customer.js';
import Institution from '../models/Institution.js';
import User from '../models/User.js';
import Panel from '../models/Panel.js';

// @desc    Get dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalCustomers, totalInstitutions, totalUsers, totalPanels] =
      await Promise.all([
        Customer.countDocuments(),
        Institution.countDocuments(),
        User.countDocuments(),
        Panel.countDocuments(),
      ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        totalInstitutions,
        totalUsers,
        totalPanels,
      },
    });
  } catch (error) {
    next(error);
  }
};

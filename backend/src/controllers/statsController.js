import Customer from '../models/Customer.js';
import Institution from '../models/Institution.js';
import User from '../models/User.js';
import Panel from '../models/Panel.js';

// @desc    Get dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    let stats = {
      totalCustomers: 0,
      totalInstitutions: 0,
      totalUsers: 0,
      totalPanels: 0
    };

    if (req.userRole === 'super_admin') {
      const [totalCustomers, totalInstitutions, totalUsers, totalPanels] =
        await Promise.all([
          Customer.countDocuments(),
          Institution.countDocuments(),
          User.countDocuments(),
          Panel.countDocuments(),
        ]);
      
      stats = { totalCustomers, totalInstitutions, totalUsers, totalPanels };

    } else if (req.userRole === 'account') {
      const [totalInstitutions, totalUsers, totalPanels] = await Promise.all([
        Institution.countDocuments({ accountId: req.accountId }),
        User.countDocuments({ accountId: req.accountId }),
        Panel.countDocuments({ accountId: req.accountId })
      ]);

      stats = {
        totalInstitutions,
        totalUsers,
        totalPanels
      };

    } else if (req.userRole === 'institution') {
      const [totalUsers, totalPanels] = await Promise.all([
        User.countDocuments({ institution: req.institutionId }),
        Panel.countDocuments({ institutionId: req.institutionId })
      ]);

      stats = {
        totalUsers,
        totalPanels
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

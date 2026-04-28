import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Institution from '../models/Institution.js';
import User from '../models/User.js';
import Panel from '../models/Panel.js';
import Patient from '../models/Patient.js';
import Event from '../models/Event.js';

// @desc    Get dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    let stats = {
      totalCustomers: 0,
      totalInstitutions: 0,
      totalUsers: 0,
      totalPanels: 0,
      totalPatients: 0,
      totalEvents: 0,
      patientsByInstitution: [],
      accountName: ''
    };

    if (req.userRole === 'super_admin') {
      const [totalCustomers, totalInstitutions, totalUsers, totalPanels, totalPatients, totalEvents, patientsByInstitution] =
        await Promise.all([
          Customer.countDocuments(),
          Institution.countDocuments(),
          User.countDocuments(),
          Panel.countDocuments(),
          Patient.countDocuments(),
          Event.countDocuments({ isDeleted: false }),
          Patient.aggregate([
            { $match: { institutionId: { $ne: null } } },
            {
              $group: {
                _id: "$institutionId",
                count: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: "institutions",
                localField: "_id",
                foreignField: "_id",
                as: "instInfo"
              }
            },
            { $unwind: "$instInfo" },
            { $project: { name: "$instInfo.name", count: 1 } },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ])
        ]);
      
      stats = { 
        totalCustomers, 
        totalInstitutions, 
        totalUsers, 
        totalPanels,
        totalPatients,
        totalEvents,
        patientsByInstitution,
        accountName: 'Super Admin'
      };

    } else if (req.userRole === 'account') {
      const [totalInstitutions, totalUsers, totalPanels, totalPatients, totalEvents, patientsByInstitution] = await Promise.all([
        Institution.countDocuments({ accountId: req.accountId }),
        User.countDocuments({ accountId: req.accountId }),
        Panel.countDocuments({ accountId: req.accountId }),
        Patient.countDocuments({ accountId: req.accountId }),
        Event.countDocuments({ accountId: req.accountId, isDeleted: false }),
        Patient.aggregate([
          { 
            $match: { 
              accountId: new mongoose.Types.ObjectId(req.accountId),
              institutionId: { $ne: null }
            } 
          },
          {
            $group: {
              _id: "$institutionId",
              count: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: "institutions",
              localField: "_id",
              foreignField: "_id",
              as: "instInfo"
            }
          },
          { $unwind: "$instInfo" },
          { $project: { name: "$instInfo.name", count: 1 } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ])
      ]);

      let accountName = 'Account';
      const customer = await Customer.findById(req.accountId).select('name');
      if (customer) accountName = customer.name;

      stats = {
        totalInstitutions,
        totalUsers,
        totalPanels,
        totalPatients,
        totalEvents,
        patientsByInstitution,
        accountName
      };

    } else if (req.userRole === 'institution') {
      const [totalUsers, totalPanels, totalPatients, totalEvents, patientsByInstitution] = await Promise.all([
        User.countDocuments({ institution: req.institutionId }),
        Panel.countDocuments({ institutionId: req.institutionId }),
        Patient.countDocuments({ institutionId: req.institutionId }),
        Event.countDocuments({ institutionId: req.institutionId, isDeleted: false }),
        Patient.aggregate([
          { 
            $match: { 
              institutionId: new mongoose.Types.ObjectId(req.institutionId) 
            } 
          },
          {
            $group: {
              _id: "$institutionId",
              count: { $sum: 1 }
            }
          },
          {
            $lookup: {
              from: "institutions",
              localField: "_id",
              foreignField: "_id",
              as: "instInfo"
            }
          },
          { $unwind: "$instInfo" },
          { $project: { name: "$instInfo.name", count: 1 } },
          { $sort: { count: -1 } },
          { $limit: 5 }
        ])
      ]);

      let accountName = 'Institution';
      const institution = await Institution.findById(req.institutionId).select('name');
      if (institution) accountName = institution.name;

      stats = {
        totalUsers,
        totalPanels,
        totalPatients,
        totalEvents,
        patientsByInstitution,
        accountName
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

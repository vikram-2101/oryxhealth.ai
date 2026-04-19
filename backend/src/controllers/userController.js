import mongoose from "mongoose";
import User from "../models/User.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role;
    const institution = req.query.institution;
    const status = req.query.status;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }
    if (institution) {
      query.institution = institution;
    }
    if (status) {
      query.status = status;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate("institution", "name")
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      users: users,
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

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "institution",
      "name",
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private
export const createUser = async (req, res, next) => {
  try {
    const { email, institution } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("A user with this email already exists");
    }

    const userData = { ...req.body };

    // Parse access list
    let accessList = [];
    if (typeof userData.institutionAccess === "string") {
      try {
        accessList = JSON.parse(userData.institutionAccess);
      } catch (e) {
        accessList = userData.institutionAccess
          .split(",")
          .filter((id) => id.trim() !== "");
      }
    } else if (Array.isArray(userData.institutionAccess)) {
      accessList = userData.institutionAccess;
    }

    // SENIOR FIX: Automatically add primary institution to access list
    if (institution && !accessList.includes(institution)) {
      accessList.push(institution);
    }
    userData.institutionAccess = accessList;

    if (req.file) {
      userData.signatureImage = `/uploads/${req.file.filename}`;
    }

    const user = await User.create(userData);
    await user.populate("institution", "name");

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res, next) => {
  try {
    console.log(" Update User Request:", {
      id: req.params.id,
      body: req.body,
      file: req.file ? req.file.filename : "no-file",
    });

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const userData = { ...req.body };

    if (userData.password === "") {
      delete userData.password;
    }

    const updateData = {};
    const allowedFields = [
      "name",
      "role",
      "sex",
      "address",
      "country",
      "state",
      "city",
      "phone",
      "email",
      "institution",
      "institutionAccess",
      "registrationNumber",
      "specialization",
      "designation",
      "photo",
      "signatureImage",
      "status",
      "password",
    ];

    console.log(
      "Validating ID:",
      req.params.id,
      "| Is Valid:",
      mongoose.Types.ObjectId.isValid(req.params.id),
    );

    allowedFields.forEach((field) => {
      if (userData[field] !== undefined) {
        // Prevent CastError by not allowing empty strings for ObjectId fields
        if (
          (field === "institution" || field === "institutionAccess") &&
          userData[field] === ""
        ) {
          return;
        }
        updateData[field] = userData[field];
      }
    });

    if (req.file) {
      updateData.signatureImage = `/uploads/${req.file.filename}`;
    }

    // Parse institutionAccess if it's sent as a string (JSON/CSV)
    if (Object.prototype.hasOwnProperty.call(userData, 'institutionAccess')) {
      let accessList = [];
      const rawAccess = userData.institutionAccess;
      
      if (typeof rawAccess === "string" && rawAccess.trim() !== "") {
        try {
          accessList = JSON.parse(rawAccess);
        } catch (e) {
          accessList = rawAccess.split(",").map(id => id.trim()).filter(id => id !== "");
        }
      } else if (Array.isArray(rawAccess)) {
        accessList = rawAccess;
      }
      
      updateData.institutionAccess = accessList;
    }

    // Ensure primary institution is in institutionAccess for consistency
    const finalInstitution = updateData.institution || user.institution;
    let finalAccess = updateData.institutionAccess || user.institutionAccess || [];

    if (finalInstitution) {
      const instIdStr = finalInstitution.toString();
      const accessStrs = finalAccess.map((id) => id.toString());

      if (!accessStrs.includes(instIdStr)) {
        finalAccess.push(instIdStr);
        updateData.institutionAccess = finalAccess;
      }
    }

    // Use Object.assign and save() instead of findByIdAndUpdate to trigger 'pre-save' hooks (e.g., password hashing)
    Object.assign(user, updateData);
    const updatedUser = await user.save();
    await updatedUser.populate("institution", "name");

    if (!updatedUser) {
      res.status(404);
      throw new Error("User not found after update");
    }

    res.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user status
// @route   PATCH /api/users/:id/status
// @access  Private
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();
    await user.populate("institution", "name");

    res.json({
      success: true,
      data: user,
      message: `User ${user.status === "active" ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

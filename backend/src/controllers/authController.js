import Admin from '../models/Admin.js';

// @desc    Register admin
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      res.status(400);
      throw new Error('Admin already exists');
    }

    // Create admin
    const admin = await Admin.create({
      name,
      email,
      password,
    });

    const token = admin.generateToken();

    res.status(201).json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token,
      },
      message: 'Admin registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for admin
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const token = admin.generateToken();

    res.json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token,
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id);

    res.json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

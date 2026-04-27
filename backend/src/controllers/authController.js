import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Customer from '../models/Customer.js';
import Institution from '../models/Institution.js';
import User from '../models/User.js';

/* =========================================
   HELPERS
========================================= */

/**
 * Sign a JWT with a payload that encodes the caller's role and
 * the tenant context needed to scope subsequent API calls.
 */
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });

/* =========================================
   UNIFIED LOGIN
   POST /api/auth/login
   Public
========================================= */
export const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Require at least one identifier and a password
    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide credentials (email or username) and password',
      });
    }

    // ── 1. Try Super Admin (always identified by email) ──────────────────
    if (email) {
      const admin = await Admin.findOne({ email }).select('+password');
      if (admin) {
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = signToken({ id: admin._id, role: 'super_admin' });
        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: 'super_admin',
            token,
          },
        });
      }
    }

    // ── 2. Try Account Admin (Customer — identified by username) ─────────
    {
      const identifier = username || email;
      const customer = await Customer.findOne({
        $or: [{ username: identifier }, { 'contactPerson.email': identifier }],
        status: 'active',
      }).select('+password');

      if (customer) {
        const isMatch = await customer.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = signToken({
          id: customer._id,
          role: 'account',
          accountId: customer._id,
        });

        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            id: customer._id,
            name: customer.name,
            role: 'account',
            accountId: customer._id,
            token,
          },
        });
      }
    }

    // ── 3. Try Institution Admin (Institution — identified by username) ───
    {
      const identifier = username || email;
      const institution = await Institution.findOne({
        $or: [{ username: identifier }, { 'contactPerson.email': identifier }],
        status: 'active',
      }).select('+password');

      if (institution) {
        const isMatch = await institution.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = signToken({
          id: institution._id,
          role: 'institution',
          institutionId: institution._id,
          accountId: institution.accountId,
        });

        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            id: institution._id,
            name: institution.name,
            role: 'institution',
            institutionId: institution._id,
            accountId: institution.accountId,
            token,
          },
        });
      }
    }

    // ── 4. Try User (with admin field check) ─────────────────────────────
    if (email) {
      const user = await User.findOne({ email }).select('+password');

      if (user) {
        // Reject normal users — they have no portal access
        if (!user.admin || user.admin === 'none') {
          return res.status(403).json({
            success: false,
            message: 'You do not have portal access. Contact your administrator.',
          });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Populate institution to derive accountId
        await user.populate('institution', 'accountId customerAccount');
        const derivedAccountId =
          user.institution?.accountId || user.institution?.customerAccount;

        const tokenPayload = {
          id: user._id,
          role: user.admin, // "account" or "institution"
          institutionId: user.institution?._id,
          accountId: derivedAccountId,
        };

        const token = signToken(tokenPayload);
        return res.json({
          success: true,
          message: 'Login successful',
          data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.admin,
            institutionId: user.institution?._id,
            accountId: derivedAccountId,
            token,
          },
        });
      }
    }

    // ── 5. Nothing matched ────────────────────────────────────────────────
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    next(error);
  }
};

/* =========================================
   REGISTER (Super Admin only — unchanged)
   POST /api/auth/register
   Public
========================================= */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const admin = await Admin.create({ name, email, password });
    const token = admin.generateToken();

    return res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'super_admin',
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* =========================================
   PROFILE
   GET /api/auth/profile
   Private
========================================= */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is already populated by authMiddleware
    const { password: _pw, ...safeUser } = req.user.toObject
      ? req.user.toObject()
      : req.user;

    return res.json({ success: true, data: safeUser });
  } catch (error) {
    next(error);
  }
};

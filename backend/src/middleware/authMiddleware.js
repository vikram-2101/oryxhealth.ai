import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Customer from '../models/Customer.js';
import Institution from '../models/Institution.js';
import User from '../models/User.js';

/**
 * protect — verifies the JWT and attaches the resolved principal
 * to req.user, req.userRole, req.accountId, and req.institutionId.
 *
 * Works for all three role tiers:
 *   super_admin  → resolved from Admin model
 *   account      → resolved from Customer model  (or User with admin:"account")
 *   institution  → resolved from Institution model (or User with admin:"institution")
 */
export const protect = async (req, res, next) => {
  try {
    // ── Extract Bearer token ──────────────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }

    const { role, id, accountId, institutionId } = decoded;

    // ── Resolve principal from the correct collection ─────────────────────
    let principal = null;

    if (role === 'super_admin') {
      principal = await Admin.findById(id).select('-password');
    } else if (role === 'account') {
      // Could be a Customer record OR a User with admin:"account"
      principal = await Customer.findById(id).select('-password');
      if (!principal) {
        principal = await User.findById(id).select('-password');
      }
    } else if (role === 'institution') {
      // Could be an Institution record OR a User with admin:"institution"
      principal = await Institution.findById(id).select('-password');
      if (!principal) {
        principal = await User.findById(id).select('-password');
      }
    } else if (['doctor', 'health_worker', 'coordinator'].includes(role)) {
      // Clinical portal users
      principal = await User.findById(id).select('-password');
    }

    if (!principal) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    // ── Attach to request for downstream controllers ───────────────────────
    req.user = principal;
    req.userRole = role;
    req.accountId = accountId ? String(accountId) : null;
    req.institutionId = institutionId ? String(institutionId) : null;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
  }
};
